import * as THREE from "https://esm.sh/three@0.180.0";
import { GLTFLoader } from "https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js";

window.__TWO_T_ENGINE_3D__ = {
  THREE,
  GLTFLoader,
  OrbitControls,
};

window.dispatchEvent(new CustomEvent("2t-engine-3d-ready"));
