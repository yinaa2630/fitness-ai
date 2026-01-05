// src/components/ParticleHuman.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function ParticleHuman({
  width = 550,
  height = 850,
  selectedMuscle = null,
  hoverMuscle = null,
  highlightMuscles = [],
}) {
  const mountRef = useRef(null);
  const meshesRef = useRef([]);
  const cameraRef = useRef(null);

  // ===========================
  // 🔥 근육 인덱스 매핑
  // ===========================
  const MUSCLE_INDEXES = {
    upper_chest: [133, 320],
    middle_chest: [134, 321],
    lower_chest: [135, 322],

    front_delts: [296, 109, 301, 114],
    side_delts: [300, 113],
    rear_delts: [299, 112, 166, 94],

    traps_upper: [100, 197],
    traps_middle: [101, 198],
    traps_lower: [102, 199],

    lat_upper_1: [195, 98],
    lat_upper_2: [193, 96],
    lat_middle: [196, 99],
    lat_lower: [192, 95],

    mid_back: [194, 97],
    erector_spinae: [138, 73],

    bicep_brachialis: [117, 304],
    brachialis: [116, 303],

    forearm_brachioradialis: [107, 294],
    forearm_flexor: [104, 201],

    triceps_long: [111, 298],
    triceps_lateral: [115, 302],
    triceps_medial: [110, 297],

    // -----------------------
    // 🍀 복근 & 외복사근
    // -----------------------
    abs_upper_1: [310, 123],
    abs_upper_2: [309, 122],
    abs_mid: [308, 121],
    abs_lower: [307, 120],
    oblique: [306, 119],

    glute_outer: [77, 142],
    glute_middle: [78, 144],
    glute_center: [359, 143],

    thigh_upper: [139, 74],
    thigh_outer: [154, 88],
    thigh_middle: [156, 90],
    thigh_lower: [155, 89],
    thigh_inner: [158, 92],

    hamstring_outer: [86, 152],
    hamstring_inner: [87, 153],

    calf_outer: [83, 149],
    calf_inner: [82, 148],
    soleus: [146, 80],
  };

  // ===========================
  // 🔥 UI → 내부 근육 key 변환 맵핑
  // ===========================
  const MUSCLE_NAME_MAP = {
    "상부 가슴": "upper_chest",
    "중부 가슴": "middle_chest",
    "하부 가슴": "lower_chest",

    "전면 삼각근": "front_delts",
    "측면 삼각근": "side_delts",
    "후면 삼각근": "rear_delts",

    "승모근 상부": "traps_upper",
    "승모근 중부": "traps_middle",
    "승모근 하부": "traps_lower",

    "광배근 상부": "lat_upper_1",
    "광배근 중부": "lat_middle",
    "광배근 하부": "lat_lower",

    "상복근 1": "abs_upper_1",
    "상복근 2": "abs_upper_2",
    "중복근 1": "abs_mid",
    "중복근 2": "abs_mid",
    "하복근": "abs_lower",
    "외복사근": "oblique",
  };

  const convertMuscle = (name) => MUSCLE_NAME_MAP[name] || name;

  // 복근 그룹
  const ABS_KEYS = [
    "abs_upper_1",
    "abs_upper_2",
    "abs_mid",
    "abs_lower",
    "oblique",
  ];

  // ===========================
  // 모델 로딩
  // ===========================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(0, 0.5, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.zoomToCursor = true;
    controls.enablePan = false;
    controls.target.set(0, 0.3, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    const loader = new OBJLoader();
    loader.load("/models/human_anatomy_musculature_obj.obj", (obj) => {
      obj.scale.set(0.009, 0.009, 0.009);
      obj.position.set(0, -0.45, 0);

      const meshes = [];

      obj.traverse((child) => {
        if (!child.isMesh) return;

        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox;
        const w = box.max.x - box.min.x;
        const h = box.max.y - box.min.y;

        if (w > 2.8 && h < 0.5) {
          child.visible = false;
          return;
        }

        child.material = new THREE.MeshStandardMaterial({
          color: 0xcfcfcf,
          metalness: 0.1,
          roughness: 0.9,
        });

        meshes.push(child);
      });

      meshesRef.current = meshes;
      scene.add(obj);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  // ===========================
  // 🔥 색칠 로직 (복근 제외 적용)
  // ===========================
  useEffect(() => {
    if (!meshesRef.current.length) return;

    // 선택된 근육 UI → 내부 key 변환
    const realSelected = convertMuscle(selectedMuscle);
    const realHover = convertMuscle(hoverMuscle);
    const realHighlights = highlightMuscles.map(convertMuscle);

    // 복근 운동인지 확인
    const isAbsSelected = ABS_KEYS.includes(realSelected);

    // 복근 제외 처리
    const filteredHighlight = isAbsSelected
      ? realHighlights
      : realHighlights.filter((m) => !ABS_KEYS.includes(m));

    const filteredHover = isAbsSelected
      ? realHover
      : ABS_KEYS.includes(realHover)
      ? null
      : realHover;

    const filteredSelected = isAbsSelected
      ? realSelected
      : ABS_KEYS.includes(realSelected)
      ? null
      : realSelected;

    // 최종 색칠 대상
    const finalList = [
      ...filteredHighlight,
      filteredHover,
      filteredSelected,
    ].filter(Boolean);

    const ROLE_COLORS = {
      primary: 0xff4444,
      secondary: 0xffa444,
      tertiary: 0x33cc66,
    };

    const roleMap = {
      primary: finalList.slice(0, 1),
      secondary: finalList.slice(1, 3),
      tertiary: finalList.slice(3),
    };

    meshesRef.current.forEach((mesh, idx) => {
      let applied = false;

      for (const role of ["primary", "secondary", "tertiary"]) {
        for (const m of roleMap[role]) {
          if (MUSCLE_INDEXES[m]?.includes(idx)) {
            mesh.material.color.setHex(ROLE_COLORS[role]);
            mesh.material.metalness = 0.45;
            mesh.material.roughness = 0.45;
            applied = true;
            break;
          }
        }
        if (applied) break;
      }

      if (!applied) {
        mesh.material.color.setHex(0xcfcfcf);
        mesh.material.metalness = 0.1;
        mesh.material.roughness = 0.9;
      }
    });
  }, [selectedMuscle, hoverMuscle, highlightMuscles]);

  // ===========================
  // mesh index 출력 (디버깅용)
  // ===========================
  useEffect(() => {
    if (!mountRef.current || !meshesRef.current.length) return;

    const dom = mountRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);

      const hits = raycaster.intersectObjects(meshesRef.current);
      if (hits.length > 0) {
        const mesh = hits[0].object;
        const idx = meshesRef.current.indexOf(mesh);
        console.log("🔥 mesh index:", idx);
      }
    };

    dom.addEventListener("click", onClick);
    return () => dom.removeEventListener("click", onClick);
  }, []);

  return <div ref={mountRef} style={{ width, height }} />;
}
