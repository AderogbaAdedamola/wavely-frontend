"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

import { Waveform } from "@/components/signal/waveform";
import { cn } from "@/lib/utils";

/**
 * The signature: a 3D "signal field". A grid of points ripples with layered
 * traveling waves that roll toward the viewer — Wavely broadcasting over the
 * air, a dimensional evolution of the console's 2D `Waveform`. Colors are read
 * live from the theme tokens (amber crest, aqua trough) so it recolors with the
 * light/dark toggle. Falls back to the SVG waveform when WebGL is unavailable,
 * freezes to a static frame under reduced motion, and pauses off-screen/hidden.
 */

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;    // plane-local xy under the cursor
  uniform float uPointerOn; // 0..1 swell strength
  uniform float uSize;
  varying float vHeight;
  varying float vDepth;

  void main() {
    vec3 p = position;
    float x = position.x;
    float y = position.y; // depth axis

    float h = 0.0;
    h += sin(x * 0.28 + uTime * 1.10) * 1.35;
    h += sin(y * 0.20 - uTime * 0.85) * 1.05;
    h += sin((x + y) * 0.15 + uTime * 0.55) * 0.75;
    h += sin((x - y) * 0.11 - uTime * 0.40) * 0.55;

    // Soft gaussian swell following the pointer.
    float d = distance(vec2(x, y), uPointer);
    h += uPointerOn * 2.6 * exp(-d * d * 0.018);

    p.z = h; // local z -> world "up" (object is rotated -90deg about X)

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    vHeight = h;

    gl_PointSize = min(uSize * (1.0 + h * 0.12) * (14.0 / vDepth), 42.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA; // trough (aqua)
  uniform vec3 uColorB; // crest (amber)
  uniform float uOpacity;
  uniform float uNear;
  uniform float uFar;
  varying float vHeight;
  varying float vDepth;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float edge = smoothstep(0.5, 0.4, dist);
    if (edge <= 0.001) discard;

    float t = smoothstep(-1.2, 1.8, vHeight);
    vec3 color = mix(uColorA, uColorB, t);

    float depthFade = 1.0 - smoothstep(uNear, uFar, vDepth);
    float alpha = uOpacity * edge * depthFade;
    if (alpha <= 0.001) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

export function SignalField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const { resolvedTheme } = useTheme();
  // Lets the theme effect reach into the live scene without re-initializing it.
  const applyThemeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!supportsWebGL()) {
      // One-time feature detection on mount: fall back to the SVG waveform.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFallback(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    THREE.ColorManagement.enabled = false; // show token hex as authored

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300);
    camera.position.set(0, 11, 38);
    camera.lookAt(0, -3, -34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const dpr = renderer.getPixelRatio();

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const small = container.clientWidth < 700;
    const geometry = new THREE.PlaneGeometry(
      90,
      130,
      small ? 104 : 168,
      small ? 150 : 210,
    );

    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerOn: { value: 0 },
      uSize: { value: 3.4 * dpr },
      uColorA: { value: new THREE.Color("#227c89") },
      uColorB: { value: new THREE.Color("#d98a26") },
      uOpacity: { value: 0.82 },
      uNear: { value: 14 },
      uFar: { value: 116 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = -Math.PI / 2;
    points.position.set(0, -3, -34);
    scene.add(points);

    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const trough = uniforms.uColorA.value as THREE.Color;
      const crest = uniforms.uColorB.value as THREE.Color;
      if (isDark) {
        // Glowing cyan→gold on deep water: additive blending stacks into light.
        trough.set(readVar("--aqua", "#46c7d0"));
        crest.set(readVar("--signal", "#f0a94c"));
        uniforms.uOpacity.value = 0.9;
        uniforms.uSize.value = 3.4 * dpr;
        material.blending = THREE.AdditiveBlending;
      } else {
        // On the cream paper, additive blending blows out to white and mid-tone
        // dots at partial alpha vanish. So in light mode paint solid ink dots —
        // a deeper teal trough for contrast, amber crest — at full strength and
        // a touch larger, blended normally, so the field reads as clearly as it
        // glows on dark.
        trough.set("#155e6b");
        crest.set(readVar("--signal", "#d98a26"));
        uniforms.uOpacity.value = 1.0;
        uniforms.uSize.value = 4.3 * dpr;
        material.blending = THREE.NormalBlending;
      }
      material.needsUpdate = true;
      renderOnce();
    };

    const setSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const renderOnce = () => renderer.render(scene, camera);

    // Pointer swell — raycast the cursor onto the field's ground plane.
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 3);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const pointerTarget = new THREE.Vector2(0, 0);
    let pointerOnTarget = 0;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        pointerOnTarget = 0;
        return;
      }
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        pointerTarget.set(hit.x, -34 - hit.z); // world -> plane-local
        pointerOnTarget = 1;
      }
    };

    let raf = 0;
    let running = false;
    let last = 0; // seconds (performance.now based) — for the frame delta
    let time = 2.0; // a pleasing static phase for the reduced-motion frame

    const tick = () => {
      const now = performance.now() * 0.001;
      const dt = Math.min(now - last, 0.05); // clamp so a long pause never jumps
      last = now;
      time += dt;
      uniforms.uTime.value = time;
      const on = uniforms.uPointerOn.value as number;
      uniforms.uPointerOn.value = on + (pointerOnTarget - on) * Math.min(1, dt * 4);
      (uniforms.uPointer.value as THREE.Vector2).lerp(
        pointerTarget,
        Math.min(1, dt * 5),
      );
      renderOnce();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      setSize(); // size to the live box before the first frame
      last = performance.now() * 0.001; // reset the delta so a pause doesn't jump
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // A single correctly-sized frame — used at init, on resize while paused, and
    // as the only frame under reduced motion.
    const renderFrame = () => {
      setSize();
      uniforms.uTime.value = time;
      renderOnce();
    };

    applyTheme();
    applyThemeRef.current = applyTheme;
    renderFrame();

    const resizeObserver = new ResizeObserver(() => {
      if (running) setSize();
      else renderFrame();
    });
    resizeObserver.observe(container);

    // Animate only while on-screen and the tab is visible; a static frame otherwise.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          if (reduce) renderFrame();
          else start();
        } else {
          stop();
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(container);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (reduce) renderFrame();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduce) window.addEventListener("pointermove", onPointerMove);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      applyThemeRef.current = () => {};
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  // Recolor the live scene when the theme flips (no re-init).
  useEffect(() => {
    applyThemeRef.current();
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      {fallback && (
        <div className="absolute inset-x-0 bottom-[12%] flex items-end">
          <Waveform mode="live" height={220} className="opacity-80" />
        </div>
      )}
    </div>
  );
}
