"use client";

import { useEffect, useRef } from "react";
import { useWhimsy } from "@/context/WhimsyContext";

interface GravitationalLensingProps {
  mouseX: number;
  mouseY: number;
}

export default function GravitationalLensing({
  mouseX,
  mouseY,
}: GravitationalLensingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { whimsyMode } = useWhimsy();
  const animationRef = useRef<number>(0);
  const imageDataSrcRef = useRef<ImageData | null>(null);
  const imageDataDstRef = useRef<ImageData | null>(null);
  const oldXRef = useRef(0);
  const oldYRef = useRef(0);

  useEffect(() => {
    if (!whimsyMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let img: HTMLImageElement;

    const radius = 100;

    const lerp = (a: number, b: number, t: number) => {
      return (b - a) * (1 - Math.exp(-t)) + a;
    };

    const smootherstep = (t: number) => {
      return 1 / Math.exp(-6 * t + 3) - Math.exp(-3);
    };

    const initCanvas = () => {
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
    };

    const resizeCanvas = () => {
      const aboutSection = document.getElementById("aboutUs");
      if (!aboutSection) return;

      const rect = aboutSection.getBoundingClientRect();
      w = rect.width;
      h = rect.height;

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      imageDataSrcRef.current = ctx.getImageData(0, 0, w, h);
      imageDataDstRef.current = ctx.getImageData(0, 0, w, h);
    };

    const updateCanvas = (
      canvas: HTMLCanvasElement,
      px: number,
      py: number
    ) => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx || !imageDataSrcRef.current || !imageDataDstRef.current) return;

      const oldx = oldXRef.current;
      const oldy = oldYRef.current;

      let xmin = oldx - radius;
      let xmax = oldx + radius;
      let ymin = oldy - radius;
      let ymax = oldy + radius;

      xmin = Math.max(0, xmin);
      xmax = Math.min(w, xmax);
      ymin = Math.max(0, ymin);
      ymax = Math.min(h, ymax);

      // Restore the old area
      for (let y = ymin; y < ymax; y++) {
        for (let x = xmin; x < xmax; x++) {
          let index = (x + y * w) << 2;
          imageDataDstRef.current.data[index] =
            imageDataSrcRef.current.data[index];
          index++;
          imageDataDstRef.current.data[index] =
            imageDataSrcRef.current.data[index];
          index++;
          imageDataDstRef.current.data[index] =
            imageDataSrcRef.current.data[index];
          index++;
          imageDataDstRef.current.data[index] = 255;
        }
      }

      const dstdata = imageDataDstRef.current.data;
      const srcdata = imageDataSrcRef.current.data;

      xmin = px - radius;
      xmax = px + radius;
      ymin = py - radius;
      ymax = py + radius;

      xmin = Math.max(0, xmin);
      xmax = Math.min(w, xmax);
      ymin = Math.max(0, ymin);
      ymax = Math.min(h, ymax);

      const tol = -15;
      const maxSize = w * (h - 1) + w - 1;

      for (let y = ymin; y < ymax; y++) {
        let index = (xmin + y * w) << 2;
        for (let x = xmin; x < xmax; x++) {
          const x1 = x - px;
          const y1 = y - py;
          const d = Math.sqrt(x1 * x1 + y1 * y1);
          if (d <= radius) {
            let sc = 1 - smootherstep((radius - d) / radius);

            const xx = Math.floor(px + x1 * sc);
            const yy = Math.floor(py + y1 * sc);

            if (sc < tol * 0.9 && sc > tol * 1.1) sc = 0.9;
            else if (sc < tol) sc = 0.1;
            else sc = 1;

            const index2 = (xx + yy * w) % maxSize << 2;
            dstdata[index++] = sc * srcdata[index2 + 0];
            dstdata[index++] = sc * srcdata[index2 + 1];
            dstdata[index++] = sc * srcdata[index2 + 2];
            index++;
          } else {
            index = index + 4;
          }
        }
      }

      // Copy the modified data
      for (let i = 0; i < dstdata.length; i++) {
        imageDataDstRef.current.data[i] = dstdata[i];
      }

      ctx.putImageData(imageDataDstRef.current, 0, 0);
      oldXRef.current = px;
      oldYRef.current = py;
    };

    const handleResize = () => {
      resizeCanvas();
    };

    const loadImage = () => {
      img = new Image();
      img.onload = () => {
        initCanvas();
        resizeCanvas();

        const py = 270;
        let ti = 0;

        const animateIntro = () => {
          if (ti++ > 100) return;
          updateCanvas(canvas, lerp(0, w * 0.8, ti / 20), py);
          animationRef.current = requestAnimationFrame(animateIntro);
        };

        animateIntro();

        window.addEventListener("resize", handleResize);
      };

      if (window.innerWidth < 1200) {
        img.src = "/astronautics/gravitational-lensing/gravitational_lensing.png";
      } else {
        img.src = "/astronautics/gravitational-lensing/gravitational_lensing_extended.png";
      }
    };

    loadImage();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [whimsyMode]);

  useEffect(() => {
    if (!whimsyMode || !canvasRef.current) return;
    const aboutSection = document.getElementById("aboutUs");
    if (!aboutSection) return;
    const rect = aboutSection.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !imageDataSrcRef.current || !imageDataDstRef.current) return;
    const px = mouseX - rect.left;
    const py = mouseY - rect.top;
    const radius = 100;
    const oldx = oldXRef.current;
    const oldy = oldYRef.current;
    let xmin = oldx - radius;
    let xmax = oldx + radius;
    let ymin = oldy - radius;
    let ymax = oldy + radius;
    xmin = Math.max(0, xmin);
    xmax = Math.min(w, xmax);
    ymin = Math.max(0, ymin);
    ymax = Math.min(h, ymax);
    for (let y = ymin; y < ymax; y++) {
      for (let x = xmin; x < xmax; x++) {
        let index = (x + y * w) << 2;
        imageDataDstRef.current.data[index] =
          imageDataSrcRef.current.data[index];
        index++;
        imageDataDstRef.current.data[index] =
          imageDataSrcRef.current.data[index];
        index++;
        imageDataDstRef.current.data[index] =
          imageDataSrcRef.current.data[index];
        index++;
        imageDataDstRef.current.data[index] = 255;
      }
    }
    const dstdata = imageDataDstRef.current.data;
    const srcdata = imageDataSrcRef.current.data;
    xmin = px - radius;
    xmax = px + radius;
    ymin = py - radius;
    ymax = py + radius;
    xmin = Math.max(0, xmin);
    xmax = Math.min(w, xmax);
    ymin = Math.max(0, ymin);
    ymax = Math.min(h, ymax);
    const tol = -15;
    const maxSize = w * (h - 1) + w - 1;
    const smootherstep = (t: number) => {
      return 1 / Math.exp(-6 * t + 3) - Math.exp(-3);
    };
    for (let y = ymin; y < ymax; y++) {
      let index = (xmin + y * w) << 2;
      for (let x = xmin; x < xmax; x++) {
        const x1 = x - px;
        const y1 = y - py;
        const d = Math.sqrt(x1 * x1 + y1 * y1);
        if (d <= radius) {
          let sc = 1 - smootherstep((radius - d) / radius);
          const xx = Math.floor(px + x1 * sc);
          const yy = Math.floor(py + y1 * sc);
          if (sc < tol * 0.9 && sc > tol * 1.1) sc = 0.9;
          else if (sc < tol) sc = 0.1;
          else sc = 1;
          const index2 = (xx + yy * w) % maxSize << 2;
          dstdata[index++] = sc * srcdata[index2 + 0];
          dstdata[index++] = sc * srcdata[index2 + 1];
          dstdata[index++] = sc * srcdata[index2 + 2];
          index++;
        } else {
          index = index + 4;
        }
      }
    }
    for (let i = 0; i < dstdata.length; i++) {
      imageDataDstRef.current.data[i] = dstdata[i];
    }
    ctx.putImageData(imageDataDstRef.current, 0, 0);
    oldXRef.current = px;
    oldYRef.current = py;
  }, [mouseX, mouseY, whimsyMode]);

  if (!whimsyMode) return null;

  return (
    <canvas
      ref={canvasRef}
      id="gravitational_lensing"
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
