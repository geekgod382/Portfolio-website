(() => {
    const MESSAGES = ["Hey there! Welcome to my website"];
    const SHOW_FIRST_AFTER_MS = 3000;   // first greeting delay
    const MESSAGE_VISIBLE_MS = 3000;    // how long a bubble stays
    const ACCENT = 0x00e5ff;            // glow color
    // --------------------
    
    const style = document.createElement('style');
    style.textContent = `
        #drone-canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999}
        #drone-bubble{position:fixed;left:0;top:0;pointer-events:none;z-index:10000;padding:8px 14px;border-radius:14px;
        background:#fff;color:#111;font:600 14px/1.2 system-ui,sans-serif;white-space:nowrap;
        box-shadow:0 6px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .3s}
        #drone-bubble::after{content:"";position:absolute;left:50%;bottom:-6px;width:12px;height:12px;background:#fff;
        transform:translateX(-50%) rotate(45deg)}
    `;
    document.head.appendChild(style);
    
    const canvas = document.createElement('canvas');
    canvas.id = 'drone-canvas';
    document.body.appendChild(canvas);
    const bubble = document.createElement('div');
    bubble.id = 'drone-bubble';
    document.body.appendChild(bubble);
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 12;
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(ACCENT, 1.2, 30);
    rim.position.set(-5, 2, 4);
    scene.add(rim);
    
    // ---- Build the drone ----
    const drone = new THREE.Group();
    const inner = new THREE.Group();
    drone.add(inner);
    
    const dark = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, metalness: 0.6, roughness: 0.35 });
    const mid = new THREE.MeshStandardMaterial({ color: 0x3d4352, metalness: 0.5, roughness: 0.4 });
    const glow = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.9 });
    
    inner.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.2), dark));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mid);
    dome.position.y = 0.175;
    inner.add(dome);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 0.3), glow);
    stripe.position.y = 0.02;
    inner.add(stripe);
    
    // camera gimbal
    const cam = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), new THREE.MeshStandardMaterial({ color: 0x0a0a0f, metalness: 0.9, roughness: 0.15 }));
    cam.position.set(0, -0.26, 0.45);
    inner.add(cam);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), glow);
    lens.position.set(0, -0.26, 0.64);
    inner.add(lens);
    
    // arms, motors, rotors
    const rotors = [];
    const leds = [];
    for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + i * (Math.PI / 2);
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.12), dark);
        arm.position.copy(dir).multiplyScalar(0.8);
        arm.rotation.y = -a;
        inner.add(arm);
    
        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.18, 16), mid);
        motor.position.copy(dir).multiplyScalar(1.6);
        inner.add(motor);
    
        const rotor = new THREE.Group();
        rotor.position.copy(dir).multiplyScalar(1.6);
        rotor.position.y = 0.14;
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x9aa4b8, transparent: true, opacity: 0.85 });
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.1), bladeMat);
        const b2 = b1.clone();
        b2.rotation.y = Math.PI / 2;
        const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.58, 32),
        new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
        );
        disc.rotation.x = -Math.PI / 2;
        rotor.add(b1, b2, disc);
        rotor.userData.spin = i % 2 ? 1 : -1;
        inner.add(rotor);
        rotors.push(rotor);
    
        // blinking LED under each motor: front = red, back = green
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshBasicMaterial({ color: dir.z > 0 ? 0xff3355 : 0x33ff88 }));
        led.position.copy(dir).multiplyScalar(1.6);
        led.position.y = -0.14;
        inner.add(led);
        leds.push(led);
    }
    scene.add(drone);
    
    // ---- Sizing ----
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        drone.scale.setScalar(window.innerWidth < 600 ? 0.5 : 0.7);
    }
    window.addEventListener('resize', resize);
    resize();
    
    function bounds() {
        const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        return { hw: hh * camera.aspect * 0.85, hh: hh * 0.8 };
    }
    
    // ---- Movement ----
    const pos = drone.position;
    const vel = new THREE.Vector3();
    const target = new THREE.Vector3();
    let hovering = false;
    let hoverTimer = 0;
    let msgIndex = 0;
    let bubbleTimeout = null;
    
    function pickTarget() {
        const b = bounds();
        target.set((Math.random() * 2 - 1) * b.hw, (Math.random() * 2 - 1) * b.hh, (Math.random() * 2 - 1) * 2);
    }
    
    function say(text) {
        bubble.textContent = text;
        bubble.style.opacity = 1;
        hoverTimer = Math.max(hoverTimer, MESSAGE_VISIBLE_MS / 1000 + 0.3);
        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => { bubble.style.opacity = 0; }, MESSAGE_VISIBLE_MS);
    }
    
    // fly in from the left edge
    pos.set(-bounds().hw - 3, 0, 0);
    pickTarget();
    setTimeout(() => { hovering = true; hoverTimer = 3; say(MESSAGES[msgIndex++ % MESSAGES.length]); }, SHOW_FIRST_AFTER_MS);
    
    // ---- Loop ----
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    let sinceMsg = 0;
    
    function frame() {
        requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        sinceMsg += dt;
    
        // spring toward target
        if (!hovering) {
        tmp.copy(target).sub(pos).multiplyScalar(2.2).addScaledVector(vel, -2.6);
        vel.addScaledVector(tmp, dt);
        if (vel.length() > 4) vel.setLength(4);
        if (pos.distanceTo(target) < 0.35 && vel.length() < 0.8) {
            hovering = true;
            hoverTimer = 1.2 + Math.random() * 2;
        }
        } else {
        vel.multiplyScalar(Math.max(0, 1 - 3 * dt)); // settle
        hoverTimer -= dt;
        if (hoverTimer <= 0) { hovering = false; pickTarget(); }
        }
        pos.addScaledVector(vel, dt);
    
        // tilt, yaw, bob
        inner.rotation.z = THREE.MathUtils.lerp(inner.rotation.z, -vel.x * 0.12, 0.1);
        inner.rotation.x = THREE.MathUtils.lerp(inner.rotation.x, 0.35 - vel.y * 0.05, 0.1);
        drone.rotation.y = THREE.MathUtils.lerp(drone.rotation.y, Math.sin(t * 0.5) * 0.4 + vel.x * 0.1, 0.05);
        inner.position.y = Math.sin(t * 2) * 0.08;
    
        // rotors + LEDs
        rotors.forEach(r => { r.rotation.y += r.userData.spin * 40 * dt; });
        const on = Math.sin(t * 8) > 0;
        leds.forEach(l => { l.visible = on; });
    
        // keep the speech bubble above the drone
        tmp.copy(pos).add(new THREE.Vector3(0, 1.2, 0)).project(camera);
        const x = THREE.MathUtils.clamp((tmp.x * 0.5 + 0.5) * window.innerWidth, 100, window.innerWidth - 100);
        const y = Math.max((-tmp.y * 0.5 + 0.5) * window.innerHeight, 50);
        bubble.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
    
        renderer.render(scene, camera);
    }
    frame();
    })();