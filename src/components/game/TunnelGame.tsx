import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, RefreshCw, Play, Heart } from 'lucide-react';

const TunnelGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Game refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const tunnelRef = useRef<THREE.Group | null>(null);
  const obstaclesRef = useRef<THREE.Mesh[]>([]);
  const frameRef = useRef<number>(0);
  const speedRef = useRef(0.2);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const initGame = () => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.05);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Tunnel
    const tunnelGroup = new THREE.Group();
    const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 32, 1, true);
    const tunnelMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      wireframe: true,
      side: THREE.BackSide,
      emissive: 0x003333,
    });
    
    for (let i = 0; i < 3; i++) {
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        tunnel.rotation.x = Math.PI / 2;
        tunnel.position.z = -i * 100;
        tunnelGroup.add(tunnel);
    }
    scene.add(tunnelGroup);
    tunnelRef.current = tunnelGroup;

    // Player (Ship)
    const playerGroup = new THREE.Group();
    const shipGeom = new THREE.ConeGeometry(0.2, 0.8, 4);
    const shipMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff });
    const ship = new THREE.Mesh(shipGeom, shipMat);
    ship.rotation.x = -Math.PI / 2;
    playerGroup.add(ship);
    
    const glowGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    playerGroup.add(glow);

    scene.add(playerGroup);
    playerRef.current = playerGroup;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
  };

  const handleKeyDown = (e: KeyboardEvent) => (keysRef.current[e.key] = true);
  const handleKeyUp = (e: KeyboardEvent) => (keysRef.current[e.key] = false);
  const handleResize = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  const spawnObstacle = (zPos: number) => {
    const geom = new THREE.IcosahedronGeometry(0.5, 0);
    const mat = new THREE.MeshPhongMaterial({ 
        color: 0xff0055, 
        emissive: 0xff0055,
        flatShading: true 
    });
    const obstacle = new THREE.Mesh(geom, mat);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 2;
    obstacle.position.x = Math.cos(angle) * radius;
    obstacle.position.y = Math.sin(angle) * radius;
    obstacle.position.z = zPos;
    
    sceneRef.current?.add(obstacle);
    obstaclesRef.current.push(obstacle);
  };

  const animate = () => {
    if (gameState !== 'playing') return;
    frameRef.current = requestAnimationFrame(animate);

    const player = playerRef.current;
    const tunnel = tunnelRef.current;
    if (!player || !tunnel) return;

    // Movement
    const moveSpeed = 0.15;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) player.position.x -= moveSpeed;
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) player.position.x += moveSpeed;
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) player.position.y += moveSpeed;
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) player.position.y -= moveSpeed;

    // Constrain player
    const limit = 4;
    player.position.x = Math.max(-limit, Math.min(limit, player.position.x));
    player.position.y = Math.max(-limit, Math.min(limit, player.position.y));

    // Ship tilt
    player.rotation.z = -player.position.x * 0.2;
    player.rotation.x = player.position.y * 0.2;

    // Move Tunnel
    tunnel.children.forEach(segment => {
      segment.position.z += speedRef.current;
      if (segment.position.z > 50) {
        segment.position.z -= 300;
      }
    });

    // Score & Speed
    setScore(s => s + 1);
    speedRef.current += 0.0001;

    // Obstacles logic
    if (Math.random() < 0.05) spawnObstacle(-100);

    obstaclesRef.current.forEach((obs, index) => {
      obs.position.z += speedRef.current;
      obs.rotation.x += 0.05;
      obs.rotation.y += 0.05;

      // Collision check
      const dist = player.position.distanceTo(obs.position);
      if (dist < 0.8) {
        setHealth(h => {
            if (h <= 1) {
                endGame();
                return 0;
            }
            return h - 1;
        });
        sceneRef.current?.remove(obs);
        obstaclesRef.current.splice(index, 1);
      }

      // Cleanup
      if (obs.position.z > 10) {
        sceneRef.current?.remove(obs);
        obstaclesRef.current.splice(index, 1);
      }
    });

    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(3);
    speedRef.current = 0.2;
    obstaclesRef.current.forEach(obs => sceneRef.current?.remove(obs));
    obstaclesRef.current = [];
    if (playerRef.current) {
        playerRef.current.position.set(0, 0, 0);
    }
    animate();
  };

  const endGame = () => {
    setGameState('gameover');
    cancelAnimationFrame(frameRef.current);
    setHighScore(prev => Math.max(prev, score));
  };

  useEffect(() => {
    initGame();
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <div ref={containerRef} className="absolute inset-0" />

      {/* HUD */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-mono text-xl">{score.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-mono text-sm">SPD: {(speedRef.current * 100).toFixed(1)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart 
                  key={i}
                  className={`w-6 h-6 ${i < health ? 'text-rose-500 fill-rose-500' : 'text-white/20'}`} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlays */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-4 tracking-tighter"
              >
                NEON RIFT
              </motion.h1>
              <p className="text-cyan-400/80 mb-8 uppercase tracking-[0.2em] text-sm font-medium">Hyper-speed survival engine</p>
              <button 
                onClick={startGame}
                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  START MISSION
                </div>
                <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <div className="mt-12 text-white/40 text-xs flex gap-8 justify-center uppercase tracking-widest">
                <span>WASD to Move</span>
                <span>Avoid Red Crystals</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 backdrop-blur-xl"
          >
            <div className="text-center p-12 border border-white/10 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent">
              <h2 className="text-red-500 text-sm font-bold tracking-[0.3em] mb-2">MISSION FAILED</h2>
              <div className="text-8xl font-black text-white mb-8 tracking-tighter">{score.toLocaleString()}</div>
              
              {score >= highScore && score > 0 && (
                <div className="mb-8 text-yellow-400 font-bold flex items-center justify-center gap-2 animate-bounce">
                  <Trophy className="w-5 h-5" /> NEW HIGH SCORE!
                </div>
              )}

              <button 
                onClick={startGame}
                className="flex items-center gap-3 mx-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                RETRY MISSION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TunnelGame;

