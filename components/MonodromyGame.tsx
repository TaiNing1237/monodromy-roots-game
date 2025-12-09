

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { LevelData, Coefficient, Target, Complex, GAME_COLORS } from '../types';
import { findRoots } from '../mathUtils';
import { PENTATONIC_SCALE } from '../constants';

interface MonodromyGameProps {
  levelData: LevelData;
  isDevMode: boolean;
  onLevelComplete: () => void;
  setDevOutput: (json: string) => void;
}

export interface MonodromyGameHandle {
  zoom: (delta: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const MonodromyGame = forwardRef<MonodromyGameHandle, MonodromyGameProps>(({ levelData, isDevMode, onLevelComplete, setDevOutput }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // State Refs
  const levelRef = useRef<LevelData>(levelData);
  const isDevModeRef = useRef<boolean>(isDevMode);
  
  useImperativeHandle(ref, () => ({
    zoom: (delta: number) => {
      if (p5Instance.current && (p5Instance.current as any).adjustZoom) {
        (p5Instance.current as any).adjustZoom(delta);
      }
    }
  }));

  useEffect(() => {
    levelRef.current = levelData;
  }, [levelData]);

  useEffect(() => {
    isDevModeRef.current = isDevMode;
  }, [isDevMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: any) => {
      // Game State
      let coeffs: Coefficient[] = [];
      let roots: Complex[] = [];
      let targets: Target[] = [];
      // Store trails in World Coordinates for correct zooming
      let rootTrails: Complex[][] = [];
      const TRAIL_LENGTH = 75; // Increased trail length
      
      // Win State
      let successTimer = 0;
      const SUCCESS_DURATION = 120; // 2 seconds at 60fps
      let isLevelComplete = false;
      let particles: Particle[] = [];

      // Audio
      let droneOsc: any;
      let feedbackOsc: any;
      let feedbackEnv: any;
      let isAudioStarted = false;

      // Interaction
      let selectedCoeff: Coefficient | null = null;
      let pickingCenterCoeff: Coefficient | null = null; // New state for 'E' key interaction
      let dragOffset = { x: 0, y: 0 };

      // View & Zoom
      const BASE_SCALE = 100; // Pixels per unit at 1.0 zoom
      let zoomLevel = 1.0;
      let currentScale = BASE_SCALE;
      let centerX = 0;
      let centerY = 0;

      p.setup = () => {
        p.createCanvas(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
        p.textFont('Courier New');
        centerX = p.width / 2;
        centerY = p.height / 2;
        
        initLevel();
      };

      p.windowResized = () => {
        if(containerRef.current) {
            p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight);
            centerX = p.width / 2;
            centerY = p.height / 2;
        }
      };

      // Exposed function for external zoom control
      p.adjustZoom = (delta: number) => {
        zoomLevel += delta;
        zoomLevel = p.constrain(zoomLevel, 0.3, 2.0); // min 0.3, max 2.0
        currentScale = BASE_SCALE * zoomLevel;
      };

      // Zoom Control
      p.mouseWheel = (event: any) => {
        // Zoom sensitivity
        const sensitivity = 0.001;
        zoomLevel -= event.delta * sensitivity;
        zoomLevel = p.constrain(zoomLevel, 0.3, 2.0); // min 0.3, max 2.0
        currentScale = BASE_SCALE * zoomLevel;
        
        // Prevent default scroll behavior
        return false;
      };

      const initAudio = () => {
        if (isAudioStarted) return;
        p.userStartAudio();
        
        droneOsc = new (window as any).p5.Oscillator('sine');
        droneOsc.freq(55);
        droneOsc.amp(0.1);
        droneOsc.start();
        
        feedbackOsc = new (window as any).p5.Oscillator('triangle');
        feedbackEnv = new (window as any).p5.Envelope();
        feedbackEnv.setADSR(0.01, 0.1, 0.1, 0.5);
        feedbackOsc.amp(feedbackEnv);
        feedbackOsc.start();

        isAudioStarted = true;
      };

      const initLevel = () => {
        const data = levelRef.current;
        isLevelComplete = false;
        successTimer = 0;
        particles = [];
        pickingCenterCoeff = null;

        // Initialize Zoom
        zoomLevel = data.zoom || 1.0;
        currentScale = BASE_SCALE * zoomLevel;
        
        // Initialize Coefficients
        coeffs = data.coeffs.map((c, idx) => {
          // Normalize parameters based on type if missing
          const params = c.constraintParams || {};
          
          // Backwards compatibility filling
          if (c.constraint === 'horizontal' && params.y === undefined) params.y = c.im;
          if (c.constraint === 'vertical' && params.x === undefined) params.x = c.re;
          if (c.constraint === 'circle') {
             if (params.radius === undefined) params.radius = p.dist(0, 0, c.re, c.im);
             if (params.center === undefined) params.center = { re: 0, im: 0 };
          }

          return {
            id: idx,
            val: { re: c.re, im: c.im },
            constraint: c.constraint,
            constraintParams: params,
            isDragging: false
          };
        });

        // Initialize Targets with ID/Color matching
        targets = data.targets.map(t => ({
          id: t.id, 
          val: { re: t.re, im: t.im },
          radius: 0.12, 
          isFilled: false
        }));

        // --- Initialize Roots with Centroid Shift (The Fix) ---
        roots = [];
        rootTrails = [];
        const n = data.degree;

        // 1. 計算重心偏移 (Shift)
        // 根據韋達定理，重心 = - (a_{n-1}) / n
        // coeffs 陣列是 [c0, c1, ..., c_{n-1}]，所以最後一個元素就是次高項係數
        let shift = { re: 0, im: 0 };
        
        if (coeffs.length > 0 && n > 0) {
            const secondHighestCoeff = coeffs[coeffs.length - 1]; // 取出 z^{n-1} 的係數
            shift = {
                re: -secondHighestCoeff.val.re / n,
                im: -secondHighestCoeff.val.im / n
            };
        }

        // 2. 產生根
        for(let i=0; i<n; i++) {
           // 加一點點偏移 (0.1) 避免完美的對稱死鎖
           const angle = (p.TWO_PI * i) / n + 0.1; 
           roots.push({ 
               re: Math.cos(angle) + shift.re, // <--- 關鍵：加上 Shift
               im: Math.sin(angle) + shift.im 
           });
           rootTrails.push([]);
        }
      };

      const spawnFireworks = () => {
          targets.forEach(t => {
              const scr = worldToScreen(t.val.re, t.val.im);
              const color = GAME_COLORS.palette[t.id % GAME_COLORS.palette.length];
              for(let i=0; i<50; i++) {
                  const angle = p.random(p.TWO_PI);
                  const speed = p.random(1, 6);
                  particles.push({
                      x: scr.x,
                      y: scr.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      life: 1.0,
                      color: color
                  });
              }
          });
      };

      // --- Interaction ---

      const screenToWorld = (sx: number, sy: number) => ({
        re: (sx - centerX) / currentScale,
        im: -(sy - centerY) / currentScale 
      });

      const worldToScreen = (wx: number, wy: number) => ({
        x: centerX + wx * currentScale,
        y: centerY - wy * currentScale
      });

      p.mousePressed = () => {
        initAudio(); 

        const mousePos = screenToWorld(p.mouseX, p.mouseY);

        // Handle Picking Center Logic
        if (pickingCenterCoeff) {
            const r = p.dist(mousePos.re, mousePos.im, pickingCenterCoeff.val.re, pickingCenterCoeff.val.im);
            pickingCenterCoeff.constraint = 'circle';
            pickingCenterCoeff.constraintParams = {
                center: { re: mousePos.re, im: mousePos.im },
                radius: r
            };
            pickingCenterCoeff = null; // Exit picking mode
            return;
        }
        
        let closestDist = 0.4; // Detection radius in world units
        selectedCoeff = null;

        coeffs.forEach(c => {
          const d = p.dist(mousePos.re, mousePos.im, c.val.re, c.val.im);
          if (d < closestDist) {
            closestDist = d;
            selectedCoeff = c;
          }
        });

        if (selectedCoeff) {
            // Check if frozen
            if (!isDevModeRef.current && selectedCoeff.constraint === 'frozen') {
              selectedCoeff = null;
              return;
            }

            selectedCoeff.isDragging = true;
            dragOffset = { 
                x: selectedCoeff.val.re - mousePos.re, 
                y: selectedCoeff.val.im - mousePos.im 
            };
        }
      };

      p.mouseReleased = () => {
        if (selectedCoeff) {
            selectedCoeff.isDragging = false;
            selectedCoeff = null;
        }
      };

      p.mouseDragged = () => {
        if (selectedCoeff && !isLevelComplete) {
            const rawMouse = screenToWorld(p.mouseX, p.mouseY);
            let targetX = rawMouse.re + dragOffset.x;
            let targetY = rawMouse.im + dragOffset.y;

            const activeConstraint = isDevModeRef.current ? 'none' : selectedCoeff.constraint;
            const params = selectedCoeff.constraintParams;

            // --- Fine-tuned Constraint Logic ---
            if (activeConstraint === 'frozen') {
                 // Do not move
                 targetX = selectedCoeff.val.re;
                 targetY = selectedCoeff.val.im;
            } 
            else if (activeConstraint === 'horizontal') {
                targetY = params.y !== undefined ? params.y : 0; 
            } 
            else if (activeConstraint === 'vertical') {
                targetX = params.x !== undefined ? params.x : 0;
            } 
            else if (activeConstraint === 'circle') {
                const cx = params.center?.re ?? 0;
                const cy = params.center?.im ?? 0;
                const r = params.radius ?? 1;
                
                // Vector from center to mouse
                const dx = targetX - cx;
                const dy = targetY - cy;
                const angle = Math.atan2(dy, dx);
                
                targetX = cx + r * Math.cos(angle);
                targetY = cy + r * Math.sin(angle);
            }

            selectedCoeff.val.re = targetX;
            selectedCoeff.val.im = targetY;

            // Drone Modulation
            if (droneOsc) {
                const speed = p.dist(p.movedX, p.movedY, 0, 0);
                droneOsc.freq(55 + speed * 2);
            }
        }
      };

      p.keyPressed = () => {
        if (!isDevModeRef.current) return;
        
        // Export logic
        if (p.key === 'P' || p.key === 'p') {
            const exportData = {
                id: levelRef.current.id,
                degree: levelRef.current.degree,
                formula: levelRef.current.formula,
                zoom: parseFloat(zoomLevel.toFixed(2)),
                coeffs: coeffs.map(c => {
                    // Update Params to match current visual position for a true "WYSIWYG" export
                    const currentRe = c.val.re;
                    const currentIm = c.val.im;
                    
                    // Clone existing params
                    const exportedParams: any = { ...c.constraintParams };
                    
                    // Force parameter sync
                    if (c.constraint === 'horizontal') {
                        exportedParams.y = currentIm;
                    } else if (c.constraint === 'vertical') {
                        exportedParams.x = currentRe;
                    } else if (c.constraint === 'circle') {
                        const cx = exportedParams.center?.re ?? 0;
                        const cy = exportedParams.center?.im ?? 0;
                        exportedParams.radius = p.dist(currentRe, currentIm, cx, cy);
                    }

                    // Clean for JSON
                    const cleanParams: any = {};
                    if (c.constraint === 'horizontal') cleanParams.y = parseFloat(exportedParams.y.toFixed(2));
                    if (c.constraint === 'vertical') cleanParams.x = parseFloat(exportedParams.x.toFixed(2));
                    if (c.constraint === 'circle') {
                        cleanParams.radius = parseFloat(exportedParams.radius.toFixed(2));
                        if (exportedParams.center && (exportedParams.center.re !== 0 || exportedParams.center.im !== 0)) {
                             cleanParams.center = {
                                 re: parseFloat(exportedParams.center.re.toFixed(2)),
                                 im: parseFloat(exportedParams.center.im.toFixed(2))
                             };
                        }
                    }

                    return {
                        re: parseFloat(currentRe.toFixed(2)),
                        im: parseFloat(currentIm.toFixed(2)),
                        constraint: c.constraint,
                        constraintParams: cleanParams
                    };
                }),
                targets: targets.map(t => ({
                    id: t.id,
                    re: parseFloat(t.val.re.toFixed(2)),
                    im: parseFloat(t.val.im.toFixed(2))
                }))
            };
            
            // Format as JS Object Literal (unquoted keys) for easy copy-pasting into constants.ts
            const jsonString = JSON.stringify(exportData, null, 2);
            const objectLiteral = jsonString.replace(/"(\w+)":/g, '$1:');
            setDevOutput(objectLiteral);
        }

        if (p.key === '2') {
             // Save current roots as new targets
             targets = roots.map((r, i) => ({
                 id: i,
                 val: { re: r.re, im: r.im },
                 radius: 0.12, // Match the initialization radius
                 isFilled: false
             }));
        }

        if (selectedCoeff) {
            if (p.key === 'H' || p.key === 'h') {
                selectedCoeff.constraint = 'horizontal';
                selectedCoeff.constraintParams = { y: selectedCoeff.val.im };
            }
            if (p.key === 'V' || p.key === 'v') {
                selectedCoeff.constraint = 'vertical';
                selectedCoeff.constraintParams = { x: selectedCoeff.val.re };
            }
            if (p.key === 'C' || p.key === 'c') {
                const r = p.dist(0, 0, selectedCoeff.val.re, selectedCoeff.val.im);
                selectedCoeff.constraint = 'circle';
                selectedCoeff.constraintParams = { radius: r, center: { re: 0, im: 0 } };
            }
            if (p.key === 'E' || p.key === 'e') {
                // Enter "Picking Center" mode
                pickingCenterCoeff = selectedCoeff;
                selectedCoeff.isDragging = false;
                selectedCoeff = null;
            }
            if (p.key === 'Z' || p.key === 'z') {
                selectedCoeff.constraint = 'frozen';
                selectedCoeff.constraintParams = {};
            }
            if (p.key === 'F' || p.key === 'f') {
                selectedCoeff.constraint = 'none';
                selectedCoeff.constraintParams = {};
            }
        }
      };

      // --- Draw Loop ---

      p.draw = () => {
        p.background(GAME_COLORS.bg);

        // --- UI Scaling ---
        // Scale UI elements (squares, dots) at a different rate (power of 0.6) 
        // than the world geometry for better usability at extreme zooms.
        const uiScale = Math.pow(zoomLevel, 0.6); 
        const rootDotSize = 12 * uiScale;
        const coeffSize = 20 * uiScale;
        
        // --- Render Fireworks ---
        if (particles.length > 0) {
            for(let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.vy += 0.1; 
                pt.life -= 0.02;
                
                p.noStroke();
                const c = p.color(pt.color);
                c.setAlpha(pt.life * 255);
                p.fill(c);
                p.ellipse(pt.x, pt.y, 4, 4);

                if(pt.life <= 0) particles.splice(i, 1);
            }
        }

        // --- Draw Grid ---
        p.stroke(GAME_COLORS.grid);
        p.strokeWeight(1);
        p.line(0, centerY, p.width, centerY);
        p.line(centerX, 0, centerX, p.height);
        p.noFill();
        p.ellipse(centerX, centerY, currentScale * 2);

        // --- Picking Center UI ---
        if (pickingCenterCoeff) {
            const ms = screenToWorld(p.mouseX, p.mouseY);
            const coeffPos = worldToScreen(pickingCenterCoeff.val.re, pickingCenterCoeff.val.im);
            const mouseScreen = { x: p.mouseX, y: p.mouseY };

            // Line from coeff to center
            p.stroke(255, 255, 0);
            p.strokeWeight(1);
            p.drawingContext.setLineDash([5, 5]);
            p.line(coeffPos.x, coeffPos.y, mouseScreen.x, mouseScreen.y);

            // Preview Circle
            const r = p.dist(ms.re, ms.im, pickingCenterCoeff.val.re, pickingCenterCoeff.val.im) * currentScale;
            p.noFill();
            p.stroke(255, 255, 0, 100);
            p.ellipse(mouseScreen.x, mouseScreen.y, r * 2);
            p.drawingContext.setLineDash([]);

            // Text
            p.fill(255, 255, 0);
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.CENTER);
            p.text("CLICK TO SET CENTER", mouseScreen.x, mouseScreen.y - 10);
            
            // Highlight Center Point
            p.fill(255, 255, 0);
            p.ellipse(mouseScreen.x, mouseScreen.y, 6, 6);
        }
        
        // --- Draw Constraints & Coefficients ---
        
        coeffs.forEach(c => {
             const isActive = c.isDragging;
             const isPicking = pickingCenterCoeff?.id === c.id;
             const isFrozen = c.constraint === 'frozen';
             
             if (c.constraint !== 'none' || isPicking) {
                 if (isFrozen) {
                     // Very subtle guide for frozen/hidden constraints if visible at all
                     p.stroke('rgba(100, 30, 30, 0.2)');
                 } else {
                     p.stroke(isActive || isPicking ? 'rgba(255,255,255,0.6)' : GAME_COLORS.constraintGuide);
                 }
                 
                 p.strokeWeight(isActive ? 2 : 1);
                 p.drawingContext.setLineDash([5, 5]);
                 p.noFill();

                 if (c.constraint === 'horizontal') {
                     const yVal = c.constraintParams.y ?? 0;
                     const yScreen = worldToScreen(0, yVal).y;
                     p.line(0, yScreen, p.width, yScreen);
                 } 
                 else if (c.constraint === 'vertical') {
                     const xVal = c.constraintParams.x ?? 0;
                     const xScreen = worldToScreen(xVal, 0).x;
                     p.line(xScreen, 0, xScreen, p.height);
                 }
                 else if (c.constraint === 'circle' && !isPicking) {
                     const r = (c.constraintParams.radius ?? 1) * currentScale;
                     const cx = (c.constraintParams.center?.re ?? 0);
                     const cy = (c.constraintParams.center?.im ?? 0);
                     const centerScreen = worldToScreen(cx, cy);
                     p.ellipse(centerScreen.x, centerScreen.y, r * 2);
                     
                     // Draw center if not origin
                     if (cx !== 0 || cy !== 0) {
                         p.line(centerScreen.x - 5, centerScreen.y, centerScreen.x + 5, centerScreen.y);
                         p.line(centerScreen.x, centerScreen.y - 5, centerScreen.x, centerScreen.y + 5);
                     }
                 }
                 p.drawingContext.setLineDash([]);
             }
        });

        // --- Math Update ---
        const simpleCoeffs = coeffs.map(c => c.val);
        // High iterations for stability
        roots = findRoots(roots, simpleCoeffs, 15);

        // --- Targets Logic ---
        let allSatisfied = true;
        
        targets.forEach((t, idx) => {
            const scr = worldToScreen(t.val.re, t.val.im);
            const color = GAME_COLORS.palette[t.id % GAME_COLORS.palette.length];
            const targetDiameter = t.radius * 2 * currentScale; // Scale target visual size with zoom

            const correctRoot = roots[t.id];
            const d = correctRoot ? p.dist(correctRoot.re, correctRoot.im, t.val.re, t.val.im) : 999;
            const isHit = d < t.radius;
            
            t.isFilled = isHit;
            if (!isHit) allSatisfied = false;

            p.noFill();
            p.stroke(color);
            p.strokeWeight(2);
            const pulse = isHit ? p.sin(p.frameCount * 0.2) * 2 : 0;
            p.ellipse(scr.x, scr.y, targetDiameter + pulse);
            
            if (isHit) {
                p.fill(color);
                const alpha = p.map(successTimer, 0, SUCCESS_DURATION, 50, 200);
                p.drawingContext.globalAlpha = alpha / 255;
                p.ellipse(scr.x, scr.y, targetDiameter * 0.7); // Scaled filled inner circle
                p.drawingContext.globalAlpha = 1;
            }
            
            if (isHit && !isLevelComplete) {
                p.noFill();
                p.stroke(255);
                p.strokeWeight(3);
                const angle = p.map(successTimer, 0, SUCCESS_DURATION, 0, p.TWO_PI);
                const arcSize = targetDiameter * 1.3; // Proportional scaling
                p.arc(scr.x, scr.y, arcSize, arcSize, -p.HALF_PI, -p.HALF_PI + angle);
            }
        });

        if (allSatisfied && !isLevelComplete && !isDevModeRef.current) {
            successTimer++;
            if (successTimer > SUCCESS_DURATION) {
                isLevelComplete = true;
                spawnFireworks();
                if (feedbackOsc) {
                    feedbackOsc.freq(523.25); 
                    feedbackEnv.play();
                }
                setTimeout(onLevelComplete, 2000); 
            }
        } else if (!isLevelComplete) {
             successTimer = 0; 
        }

        // --- Render Roots & Trails ---
        roots.forEach((root, i) => {
            const scr = worldToScreen(root.re, root.im);
            const color = GAME_COLORS.palette[i % GAME_COLORS.palette.length];
            
            // Push World Coordinate to trails
            rootTrails[i].push({ re: root.re, im: root.im });
            if (rootTrails[i].length > TRAIL_LENGTH) rootTrails[i].shift();

            p.noFill();
            p.strokeWeight(4 * uiScale); // Scale stroke
            const cStr = p.color(color);
            cStr.setAlpha(50);
            p.stroke(cStr);
            p.beginShape();
            // Project trails to screen space dynamically
            rootTrails[i].forEach(pos => {
                const s = worldToScreen(pos.re, pos.im);
                p.vertex(s.x, s.y);
            });
            p.endShape();

            p.noStroke();
            p.fill(color);
            p.drawingContext.shadowBlur = 15;
            p.drawingContext.shadowColor = color;
            p.ellipse(scr.x, scr.y, rootDotSize); // Scaled dot
            p.drawingContext.shadowBlur = 0;
        });

        // --- Render Coefficients ---
        coeffs.forEach(c => {
            const scr = worldToScreen(c.val.re, c.val.im);
            const isHover = c.id === selectedCoeff?.id;
            const isPicking = pickingCenterCoeff?.id === c.id;
            const isFrozen = c.constraint === 'frozen';
            
            p.strokeWeight(2);

            if (isFrozen) {
                // Dark, obscure red for frozen items
                p.stroke('rgba(100, 40, 40, 0.3)');
                p.fill('rgba(50, 0, 0, 0.5)');
            } else {
                p.stroke(isHover || isPicking ? '#fff' : GAME_COLORS.coeff);
                p.fill(c.isDragging || isPicking ? GAME_COLORS.coeffActive : 'rgba(255, 0, 85, 0.5)');
            }
            
            // Neon Glow (Only if NOT frozen)
            if (!isFrozen && (c.isDragging || isHover || isPicking)) {
                p.drawingContext.shadowBlur = 20;
                p.drawingContext.shadowColor = GAME_COLORS.coeffActive;
            }

            p.rectMode(p.CENTER);
            p.rect(scr.x, scr.y, coeffSize, coeffSize); // Scaled square

            // Frozen / Lock Icon
            if (isFrozen) {
                 p.stroke('rgba(150, 50, 50, 0.5)'); // Dimmed X
                 p.strokeWeight(1);
                 // Draw a little 'X', scaled
                 const xSize = 5 * uiScale;
                 p.line(scr.x - xSize, scr.y - xSize, scr.x + xSize, scr.y + xSize);
                 p.line(scr.x + xSize, scr.y - xSize, scr.x - xSize, scr.y + xSize);
            }

            p.drawingContext.shadowBlur = 0;

            if (isDevModeRef.current) {
                p.fill(255);
                p.noStroke();
                p.textSize(10);
                p.text(`C${c.id}`, scr.x + 15, scr.y - 15);
                if (isHover) {
                    p.text(`${c.constraint}`, scr.x + 15, scr.y);
                }
            }
        });
      };
    };

    p5Instance.current = new (window as any).p5(sketch, containerRef.current);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, [levelData.id]); 

  return <div ref={containerRef} className="w-full h-full" />;
});

export default MonodromyGame;
