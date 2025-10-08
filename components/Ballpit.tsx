"use client"

import React, { useRef, useEffect } from 'react';
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebGLRendererParameters,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
  BufferGeometry,
  BoxGeometry,
  ConeGeometry,
  IcosahedronGeometry,
  CylinderGeometry,
  TorusGeometry,
  Group,
  Mesh,
  Float32BufferAttribute
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Observer } from 'gsap/Observer';
import { gsap } from 'gsap';

gsap.registerPlugin(Observer);

interface XConfig {
  canvas?: HTMLCanvasElement;
  id?: string;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: 'parent' | { width: number; height: number };
}

interface SizeData {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

class X {
  #config: XConfig;
  #postprocessing: unknown;
  #resizeObserver?: ResizeObserver;
  #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number;
  #animationFrameId: number = 0;
  #clock: Clock = new Clock();
  #animationState = { elapsed: 0, delta: 0 };
  #isAnimating: boolean = false;
  #isVisible: boolean = false;

  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0
  };

  render: () => void = this.#render.bind(this);
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => { };
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => { };
  onAfterResize: (size: SizeData) => void = () => { };
  isDisposed: boolean = false;

  constructor(config: XConfig) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }

  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #initScene() {
    this.scene = new Scene();
    this.scene.background = new Color(0xffffff);
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      const elem = document.getElementById(this.#config.id);
      if (elem instanceof HTMLCanvasElement) {
        this.canvas = elem;
      } else {
        console.error('Three: Missing canvas or id parameter');
      }
    } else {
      console.error('Three: Missing canvas or id parameter');
    }
    this.canvas!.style.display = 'block';
    const rendererOptions: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {})
    };
    this.renderer = new WebGLRenderer(rendererOptions);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }

  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }

  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100);
  }

  resize() {
    let w: number, h: number;
    if (this.#config.size instanceof Object) {
      w = this.#config.size.width;
      h = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth;
      h = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;
    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
    const newTan = tanFov / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if ((this.camera as { isOrthographicCamera?: boolean }).isOrthographicCamera) {
      const cam = this.camera as unknown as { top: number; bottom: number; right: number; left: number };
      this.size.wHeight = cam.top - cam.bottom;
      this.size.wWidth = cam.right - cam.left;
    }
  }

  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    if (this.#postprocessing && typeof this.#postprocessing === 'object' && 'setSize' in this.#postprocessing) {
      (this.#postprocessing as { setSize: (w: number, h: number) => void }).setSize(this.size.width, this.size.height);
    }
    let pr = window.devicePixelRatio;
    if (this.maxPixelRatio && pr > this.maxPixelRatio) {
      pr = this.maxPixelRatio;
    } else if (this.minPixelRatio && pr < this.minPixelRatio) {
      pr = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pr);
    this.size.pixelRatio = pr;
  }

  get postprocessing() {
    return this.#postprocessing;
  }
  set postprocessing(value: unknown) {
    this.#postprocessing = value;
    if (value && typeof value === 'object' && 'render' in value && typeof (value as { render: () => void }).render === 'function') {
      this.render = (value as { render: () => void }).render.bind(value);
    }
  }

  #onIntersection(entries: IntersectionObserverEntry[]) {
    this.#isAnimating = entries[0].isIntersecting;
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
  }

  #onVisibilityChange() {
    if (this.#isAnimating) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation();
    }
  }

  #startAnimation() {
    if (this.#isVisible) return;
    const animateFrame = () => {
      this.#animationFrameId = requestAnimationFrame(animateFrame);
      this.#animationState.delta = this.#clock.getDelta();
      this.#animationState.elapsed += this.#animationState.delta;
      this.onBeforeRender(this.#animationState);
      this.render();
      this.onAfterRender(this.#animationState);
    };
    this.#isVisible = true;
    this.#clock.start();
    animateFrame();
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#isVisible = false;
      this.#clock.stop();
    }
  }

  #render() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse(obj => {
      const mesh = obj as { isMesh?: boolean; material?: { dispose?: () => void;[key: string]: unknown }; geometry?: { dispose?: () => void } };
      if (mesh.isMesh && typeof mesh.material === 'object' && mesh.material !== null) {
        Object.keys(mesh.material).forEach(key => {
          const matProp = mesh.material![key];
          if (matProp && typeof matProp === 'object' && typeof (matProp as { dispose?: () => void }).dispose === 'function') {
            (matProp as { dispose: () => void }).dispose();
          }
        });
        mesh.material?.dispose?.();
        mesh.geometry?.dispose?.();
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#onResizeCleanup();
    this.#stopAnimation();
    this.clear();
    if (this.#postprocessing && typeof this.#postprocessing === 'object' && 'dispose' in this.#postprocessing) {
      (this.#postprocessing as { dispose: () => void }).dispose();
    }
    this.renderer.dispose();
    this.isDisposed = true;
  }

  #onResizeCleanup() {
    window.removeEventListener('resize', this.#onResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#onVisibilityChange.bind(this));
  }
}

interface WConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  minSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  controlSphere0?: boolean;
  followCursor?: boolean;
}

class W {
  config: WConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3 = new Vector3();

  constructor(config: WConfig) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.#initializePositions();
    this.setSizes();
  }

  #initializePositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;
    if (config.controlSphere0) {
      startIdx = 1;
      const firstVec = new Vector3().fromArray(positionData, 0);
      firstVec.lerp(center, 0.1).toArray(positionData, 0);
      new Vector3(0, 0, 0).toArray(velocityData, 0);
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);
      vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
      vel.multiplyScalar(config.friction);
      vel.clampLength(0, config.maxVelocity);
      pos.add(vel);
      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);
      const radius = sizeData[idx];
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        const otherPos = new Vector3().fromArray(positionData, otherBase);
        const otherVel = new Vector3().fromArray(velocityData, otherBase);
        const diff = new Vector3().copy(otherPos).sub(pos);
        const dist = diff.length();
        const sumRadius = radius + sizeData[jdx];
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          const correction = diff.normalize().multiplyScalar(0.5 * overlap);
          const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 1));
          pos.sub(correction);
          vel.sub(velCorrection);
          pos.toArray(positionData, base);
          vel.toArray(velocityData, base);
          otherPos.add(correction);
          otherVel.add(correction.clone().multiplyScalar(Math.max(otherVel.length(), 1)));
          otherPos.toArray(positionData, otherBase);
          otherVel.toArray(velocityData, otherBase);
        }
      }
      if (config.controlSphere0) {
        const diff = new Vector3().copy(new Vector3().fromArray(positionData, 0)).sub(pos);
        const d = diff.length();
        const sumRadius0 = radius + sizeData[0];
        if (d < sumRadius0) {
          const correction = diff.normalize().multiplyScalar(sumRadius0 - d);
          const velCorrection = correction.clone().multiplyScalar(Math.max(vel.length(), 2));
          pos.sub(correction);
          vel.sub(velCorrection);
        }
      }
      if (Math.abs(pos.x) + radius > config.maxX) {
        pos.x = Math.sign(pos.x) * (config.maxX - radius);
        vel.x = -vel.x * config.wallBounce;
      }
      if (config.gravity === 0) {
        if (Math.abs(pos.y) + radius > config.maxY) {
          pos.y = Math.sign(pos.y) * (config.maxY - radius);
          vel.y = -vel.y * config.wallBounce;
        }
      } else if (pos.y - radius < -config.maxY) {
        pos.y = -config.maxY + radius;
        vel.y = -vel.y * config.wallBounce;
      }
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(pos.z) + radius > maxBoundary) {
        pos.z = Math.sign(pos.z) * (config.maxZ - radius);
        vel.z = -vel.z * config.wallBounce;
      }
      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
  }
}

class Y extends MeshPhysicalMaterial {
  uniforms: { [key: string]: { value: unknown } } = {
    thicknessDistortion: { value: 0.1 },
    thicknessAmbient: { value: 0 },
    thicknessAttenuation: { value: 0.1 },
    thicknessPower: { value: 2 },
    thicknessScale: { value: 10 }
  };

  constructor(params: Record<string, unknown>) {
    super(params);
    (this as { defines?: { USE_UV: string } }).defines = { USE_UV: '' };
    this.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
        `
      );
      const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsChunk);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
  onBeforeCompile2?: (shader: unknown) => void;
}

const XConfig = {
  count: 60,
  colors: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff],
  ambientColor: 0xffffff,
  ambientIntensity: 0.8,
  lightIntensity: 100,
  materialParams: {
    metalness: 0.1,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  },
  minSize: 0.3,
  maxSize: 1.2,
  size0: 1.5,
  gravity: 1,
  friction: 0.985,
  wallBounce: 0.95,
  maxVelocity: 0.2,
  maxX: 8,
  maxY: 8,
  maxZ: 4,
  controlSphere0: false,
  followCursor: false
};

const U = new Object3D();

let globalPointerActive = false;
const pointerPosition = new Vector2();

interface PointerData {
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (data: PointerData) => void;
  onMove: (data: PointerData) => void;
  onClick: (data: PointerData) => void;
  onLeave: (data: PointerData) => void;
  dispose?: () => void;
}

const pointerMap = new Map<HTMLElement, PointerData>();

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
  const defaultData: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => { },
    onMove: () => { },
    onClick: () => { },
    onLeave: () => { },
    ...options
  };
  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, defaultData);
    if (!globalPointerActive) {
      document.body.addEventListener('pointermove', onPointerMove as EventListener);
      document.body.addEventListener('pointerleave', onPointerLeave as EventListener);
      document.body.addEventListener('click', onPointerClick as EventListener);

      document.body.addEventListener('touchstart', onTouchStart as EventListener, {
        passive: false
      });
      document.body.addEventListener('touchmove', onTouchMove as EventListener, {
        passive: false
      });
      document.body.addEventListener('touchend', onTouchEnd as EventListener, {
        passive: false
      });
      document.body.addEventListener('touchcancel', onTouchEnd as EventListener, {
        passive: false
      });
      globalPointerActive = true;
    }
  }
  defaultData.dispose = () => {
    pointerMap.delete(options.domElement);
    if (pointerMap.size === 0) {
      document.body.removeEventListener('pointermove', onPointerMove as EventListener);
      document.body.removeEventListener('pointerleave', onPointerLeave as EventListener);
      document.body.removeEventListener('click', onPointerClick as EventListener);

      document.body.removeEventListener('touchstart', onTouchStart as EventListener);
      document.body.removeEventListener('touchmove', onTouchMove as EventListener);
      document.body.removeEventListener('touchend', onTouchEnd as EventListener);
      document.body.removeEventListener('touchcancel', onTouchEnd as EventListener);
      globalPointerActive = false;
    }
  };
  return defaultData;
}

function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  processPointerInteraction();
}

function processPointerInteraction() {
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && !data.touching) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        data.touching = true;
        updatePointerData(data, rect);
        if (!data.hover) {
          data.hover = true;
          data.onEnter(data);
        }
        data.onMove(data);
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      updatePointerData(data, rect);
      if (isInside(rect)) {
        if (!data.hover) {
          data.hover = true;
          data.touching = true;
          data.onEnter(data);
        }
        data.onMove(data);
      } else if (data.hover && data.touching) {
        data.onMove(data);
      }
    }
  }
}

function onTouchEnd() {
  for (const [, data] of pointerMap) {
    if (data.touching) {
      data.touching = false;
      if (data.hover) {
        data.hover = false;
        data.onLeave(data);
      }
    }
  }
}

function onPointerClick(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInside(rect)) data.onClick(data);
  }
}

function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top);
  data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1);
}

function isInside(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  );
}

// Load STL Anchor
function createAnchorSTLGeometry(): Promise<BufferGeometry> {
  return new Promise((resolve) => {
    const loader = new STLLoader();
    // You'll need to put your anchor.stl file in the public folder
    loader.load(
      '/anchor_v3.stl', // Path to your STL file
      (geometry) => {
        // Center and scale the geometry
        geometry.center();
        geometry.scale(0.06, 0.06, 0.06); // Scale down more to make anchors smaller
        resolve(geometry);
      },
      (progress) => {
        console.log('Loading anchor STL:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading STL:', error);
        // Fallback to a simple anchor if STL fails
        resolve(createSimpleAnchorGeometry());
      }
    );
  });
}

// Fallback simple anchor if STL fails
function createSimpleAnchorGeometry(): BufferGeometry {
  const group = new Group();

  // Ring at top
  const ring = new TorusGeometry(0.12, 0.03, 8, 16);
  const ringMesh = new Mesh(ring);
  ringMesh.position.y = 0.24;
  ringMesh.rotation.x = Math.PI / 2;
  group.add(ringMesh);

  // Shank (main vertical bar)
  const shank = new CylinderGeometry(0.024, 0.036, 0.72, 8);
  const shankMesh = new Mesh(shank);
  shankMesh.position.y = -0.12;
  group.add(shankMesh);

  // Stock (horizontal bar at bottom)
  const stock = new CylinderGeometry(0.018, 0.018, 0.48, 8);
  const stockMesh = new Mesh(stock);
  stockMesh.rotation.z = Math.PI / 2;
  stockMesh.position.y = -0.36;
  group.add(stockMesh);

  // Left fluke
  const leftFluke = new BoxGeometry(0.072, 0.24, 0.048);
  const leftFlukeMesh = new Mesh(leftFluke);
  leftFlukeMesh.position.set(-0.24, -0.45, 0);
  leftFlukeMesh.rotation.z = -Math.PI / 4;
  group.add(leftFlukeMesh);

  // Right fluke
  const rightFluke = new BoxGeometry(0.072, 0.24, 0.048);
  const rightFlukeMesh = new Mesh(rightFluke);
  rightFlukeMesh.position.set(0.24, -0.45, 0);
  rightFlukeMesh.rotation.z = Math.PI / 4;
  group.add(rightFlukeMesh);

  // Merge all geometries
  const mergedGeometry = new BufferGeometry();
  const geometries: BufferGeometry[] = [];

  group.children.forEach((child) => {
    if (child instanceof Mesh && child.geometry) {
      const geo = child.geometry.clone();
      child.updateMatrix();
      geo.applyMatrix4(child.matrix);
      geometries.push(geo);
    }
  });

  if (geometries.length > 0) {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    let indexOffset = 0;

    geometries.forEach((geo) => {
      const pos = geo.attributes.position;
      const norm = geo.attributes.normal;
      const uv = geo.attributes.uv;
      const idx = geo.index;

      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        }
      }
      if (norm) {
        for (let i = 0; i < norm.count; i++) {
          normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
        }
      }
      if (uv) {
        for (let i = 0; i < uv.count; i++) {
          uvs.push(uv.getX(i), uv.getY(i));
        }
      }
      if (idx) {
        for (let i = 0; i < idx.count; i++) {
          indices.push(idx.getX(i) + indexOffset);
        }
      }
      indexOffset += pos ? pos.count : 0;
    });

    mergedGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    mergedGeometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    if (uvs.length > 0) {
      mergedGeometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    }
    if (indices.length > 0) {
      mergedGeometry.setIndex(indices);
    }
    mergedGeometry.computeVertexNormals();
  }

  return mergedGeometry;
}

// Other geometric shapes
function createConeGeometry(): BufferGeometry {
  return new ConeGeometry(0.5, 1, 8);
}

function createCubeGeometry(): BufferGeometry {
  return new BoxGeometry(0.8, 0.8, 0.8);
}

function createIcosahedronGeometry(): BufferGeometry {
  return new IcosahedronGeometry(0.5, 0);
}

type GeometryType = 'sphere' | 'anchor';

class Z extends InstancedMesh {
  config: typeof XConfig;
  physics: W;
  ambientLight: AmbientLight | undefined;
  light: PointLight | undefined;
  instanceMeshes: Map<GeometryType, InstancedMesh>;
  geometryTypes: GeometryType[];

  constructor(renderer: WebGLRenderer, params: Partial<typeof XConfig> = {}) {
    const config = { ...XConfig, ...params };
    const roomEnv = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(roomEnv).texture;

    // Use sphere as the main geometry for the parent InstancedMesh
    const geometry = new SphereGeometry();
    const material = new Y({ envMap: envTexture, ...config.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, config.count);

    this.config = config;
    this.physics = new W(config);
    this.instanceMeshes = new Map();

    // Distribute objects: 60% spheres, 40% anchors
    this.geometryTypes = [];

    for (let i = 0; i < config.count; i++) {
      const rand = Math.random();
      if (rand < 0.6) {
        this.geometryTypes.push('sphere');
      } else {
        this.geometryTypes.push('anchor');
      }
    }

    // Count each type
    const typeCounts = new Map<GeometryType, number>();
    this.geometryTypes.forEach(type => {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    // Create instanced meshes for each type
    this.#createInstanceMeshes(typeCounts, envTexture, config);

    this.#setupLights();
  }

  async #createInstanceMeshes(typeCounts: Map<GeometryType, number>, envTexture: unknown, config: typeof XConfig) {
    // Create all geometries first
    const geometries = new Map<GeometryType, BufferGeometry>();

    for (const [type, count] of typeCounts) {
      if (count > 0) {
        let geom: BufferGeometry;

        switch (type) {
          case 'sphere':
            geom = new SphereGeometry();
            break;
          case 'anchor':
            try {
              geom = await createAnchorSTLGeometry();
            } catch (error) {
              console.warn('Failed to load STL anchor, using fallback:', error);
              geom = createSimpleAnchorGeometry();
            }
            break;
          default:
            geom = new SphereGeometry();
        }

        geometries.set(type, geom);
      }
    }

    // Now create all instance meshes with the loaded geometries
    for (const [type, count] of typeCounts) {
      if (count > 0) {
        const geom = geometries.get(type)!;
        const mat = new Y({ envMap: envTexture, ...config.materialParams });
        mat.envMapRotation.x = -Math.PI / 2;

        // Make anchors chrome/metallic like spheres
        if (type === 'anchor') {
          mat.metalness = 0.1; // Match sphere metalness
          mat.roughness = 0.2; // Match sphere roughness
          mat.clearcoat = 1; // Match sphere clearcoat
          mat.clearcoatRoughness = 0.1; // Match sphere clearcoat roughness
        }

        const instanceMesh = new InstancedMesh(geom, mat, count);
        this.instanceMeshes.set(type, instanceMesh);
        this.add(instanceMesh);
      }
    }

    // Apply colors after all meshes are created
    this.setColors(config.colors);
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors: number[]) {
    if (Array.isArray(colors) && colors.length > 1) {
      const colorUtils = (function (colorsArr: number[]) {
        const baseColors: number[] = colorsArr;
        const colorObjects: Color[] = [];
        baseColors.forEach(col => {
          colorObjects.push(new Color(col));
        });
        return {
          getColorAt: (ratio: number, out: Color = new Color()) => {
            const clamped = Math.max(0, Math.min(1, ratio));
            const scaled = clamped * (baseColors.length - 1);
            const idx = Math.floor(scaled);
            const start = colorObjects[idx];
            if (idx >= baseColors.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = colorObjects[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          }
        };
      })(colors);

      // Track indices for each type
      const typeIndices = new Map<GeometryType, number>();
      this.instanceMeshes.forEach((_, type) => {
        typeIndices.set(type, 0);
      });

      for (let idx = 0; idx < this.count; idx++) {
        const color = colorUtils.getColorAt(idx / this.count);
        const type = this.geometryTypes[idx];
        const instanceMesh = this.instanceMeshes.get(type);

        if (instanceMesh) {
          const typeIdx = typeIndices.get(type) || 0;
          instanceMesh.setColorAt(typeIdx, color);
          typeIndices.set(type, typeIdx + 1);
        }

        if (idx === 0) {
          this.light!.color.copy(color);
        }
      }

      // Update all instance colors
      this.instanceMeshes.forEach((instanceMesh) => {
        if (instanceMesh.instanceColor) {
          instanceMesh.instanceColor.needsUpdate = true;
        }
      });
    }
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);

    // Track indices for each type
    const typeIndices = new Map<GeometryType, number>();
    this.instanceMeshes.forEach((_, type) => {
      typeIndices.set(type, 0);
    });

    for (let idx = 0; idx < this.count; idx++) {
      U.position.fromArray(this.physics.positionData, 3 * idx);

      if (idx === 0 && this.config.followCursor === false) {
        U.scale.setScalar(0);
      } else {
        U.scale.setScalar(this.physics.sizeData[idx]);
      }

      const type = this.geometryTypes[idx];

      // Add rotation based on object type
      if (type === 'sphere') {
        U.rotation.set(0, 0, 0);
      } else if (type === 'anchor') {
        // Anchors rotate slowly and tumble
        U.rotation.x += deltaInfo.delta * 0.3;
        U.rotation.y += deltaInfo.delta * 0.2;
      }

      U.updateMatrix();

      // Update the appropriate instance mesh
      const instanceMesh = this.instanceMeshes.get(type);
      if (instanceMesh) {
        const typeIdx = typeIndices.get(type) || 0;
        instanceMesh.setMatrixAt(typeIdx, U.matrix);
        typeIndices.set(type, typeIdx + 1);
      }

      if (idx === 0) this.light!.position.copy(U.position);
    }

    // Update all instance matrices
    this.instanceMeshes.forEach((instanceMesh) => {
      instanceMesh.instanceMatrix.needsUpdate = true;
    });
  }
}

interface CreateBallpitReturn {
  three: X;
  spheres: Z;
  setCount: (count: number) => void;
  togglePause: () => void;
  dispose: () => void;
}

function createBallpit(canvas: HTMLCanvasElement, config: Record<string, unknown> = {}): CreateBallpitReturn {
  const threeInstance = new X({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  let spheres: Z;
  threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
  threeInstance.camera.position.set(0, 0, 20);
  threeInstance.camera.lookAt(0, 0, 0);
  threeInstance.cameraMaxAspect = 1.5;
  threeInstance.resize();
  initialize(config);
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectionPoint = new Vector3();
  let isPaused = false;

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  (canvas.style as { webkitUserSelect?: string }).webkitUserSelect = 'none';

  const pointerData = createPointerData({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera);
      threeInstance.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      spheres.physics.center.copy(intersectionPoint);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    }
  });
  function initialize(cfg: Record<string, unknown>) {
    if (spheres) {
      threeInstance.clear();
      threeInstance.scene.remove(spheres);
    }
    spheres = new Z(threeInstance.renderer, cfg);
    threeInstance.scene.add(spheres);
  }
  threeInstance.onBeforeRender = deltaInfo => {
    if (!isPaused) spheres.update(deltaInfo);
  };
  threeInstance.onAfterResize = size => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };
  return {
    three: threeInstance,
    get spheres() {
      return spheres;
    },
    setCount(count: number) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointerData.dispose?.();
      threeInstance.dispose();
    }
  };
}

interface BallpitProps {
  className?: string;
  followCursor?: boolean;
  [key: string]: unknown;
}

const Ballpit: React.FC<BallpitProps> = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spheresInstanceRef = useRef<CreateBallpitReturn | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spheresInstanceRef.current = createBallpit(canvas, {
      followCursor,
      ...props
    });

    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      className={`${className} w-full h-full`}
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
};

export default Ballpit;