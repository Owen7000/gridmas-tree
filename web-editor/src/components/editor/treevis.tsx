"use client"
import { tree } from "@/util/trees/2025";
import { Billboard, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Camera } from "lucide-react";
import { useEffect, useMemo, useRef, createRef } from "react";
import { Button } from "../ui/button";
import type { MeshStandardMaterial } from "three";

const treeHeight = Math.max(...tree.map((x) => x[2]))
export default function TreeVis({
  pyodide,
  running,
  onFrameMs,
  onLog,
}: {
  pyodide: any,
  running: boolean,
  onFrameMs?: (ms: number) => void,
  onLog?: (message: string, frame: number, isError?: boolean) => void,
}) {

  const canvasRef = useRef<any>(null)
  const frameRef = useRef<number>(0)

  // Create stable refs for each material without calling hooks in a loop
  const matRefs = useMemo(() => (
    Array.from({ length: tree.length }, () => createRef<MeshStandardMaterial>())
  ), [])

  function handlePhoto() {
    if (canvasRef.current === null) { return }

    const dataURL = canvasRef.current.domElement.toDataURL("image/jpeg")

    const image = new Image()
    image.src = dataURL
    image.onload = () => {
      const newCanvas = document.createElement("canvas")
      newCanvas.width = 420
      newCanvas.height = 750
      const ctx = newCanvas.getContext("2d")
      if (!ctx) return
      const startX = (image.width - 420) / 2;
      const startY = (image.height - 750) / 2;
      ctx.drawImage(image, startX, startY, 420, 750, 0, 0, 420, 750);

      // Save cropped image
      const croppedURL = newCanvas.toDataURL("image/jpeg");
      const link = document.createElement("a");
      link.download = "canvas-image.jpeg";
      link.href = croppedURL;
      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
    }

  }


  // if we see running change
  useEffect(() => {
    if (running) {
      if (pyodide == null) {
        return
      }
      frameRef.current = 0
      
      let animationFrameId: number;
      let lastFrameTime = 0;
      const targetFrameTime = 1000 / 45; // 45 FPS = ~22.22ms per frame

      function animate(currentTime: number) {
        if (!running) return;

        const deltaTime = currentTime - lastFrameTime;

        if (deltaTime >= targetFrameTime) {
          const start = performance.now()
          try {
            // Use the new generator-based system
            const res: any = pyodide.runPython(`
try:
    # Check if we have a generator in the global scope
    if 'pattern_generator' not in globals() or pattern_generator is None:
        # Create a new generator from the pattern
        pattern_generator = curPattern.draw()
        if pattern_generator:
            next(pattern_generator)
    else:
        # If we have a generator, call next() on it
        try:
            next(pattern_generator)
        except StopIteration:
            # Generator is exhausted, create a new one
            pattern_generator = curPattern.draw()
            if pattern_generator:
                next(pattern_generator)
        except Exception as e:
            print_to_react(f"Error in pattern generator: {e}", 0)
            pattern_generator = None
except Exception as e:
    print_to_react(f"Error in pattern execution: {e}", 0)
    pattern_generator = None

# Get the current tree state after pattern execution
tree.request_frame()
`)
            
            // Extract the lights data from the tree state
            const lights: number[][] = res.toJs().map((x: number) => [((x >> 8) & 255) / 255, ((x >> 16) & 255) / 255, (x & 255) / 255])
            
            // Update the material colors for each tree node
            for (let i = 0; i < tree.length; i++) {
              const mat = matRefs[i].current
              if (mat) {
                // use setRGB for clarity
                mat.color.setRGB(lights[i][0], lights[i][1], lights[i][2])
              }
            }
            
            // prevent PyProxy leaks on older pyodide versions
            if (typeof res?.destroy === 'function') {
              res.destroy()
            }
          } catch (error: any) {
            // surface errors to the parent output panel
            onLog?.(String(error), frameRef.current, true)
          } finally {
            const end = performance.now()
            onFrameMs?.(end - start)
            frameRef.current += 1
          }
          
          lastFrameTime = currentTime;
        }

        animationFrameId = requestAnimationFrame(animate);
      }

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }
    }
  }, [running, pyodide, matRefs, onFrameMs, onLog])


  return (
    <div className={`h-full `}>
      <div className="fixed bottom-2 right-2 hidden">
        <Button onClick={handlePhoto} className="cursor-pointer z-1000">
          <Camera />
        </Button>
      </div>


      {/* tree visualiser */}
      <Canvas style={{ background: "rgb(1, 1, 1)" }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => {
        canvasRef.current = gl
      }} camera={{ translateY: 2 }}>
        <ambientLight />
        {tree.map(([x, y, z], i) => (
          <mesh key={i} position={[x, z, y]}>
            <sphereGeometry args={[0.025]} />
            <meshStandardMaterial ref={matRefs[i]} color={[0, 0, 0]} />
          </mesh>
        ))}
        {/*  X axis  */}
        <Line points={[[-1, 0, 0], [1, 0, 0]]} color={"red"} />
        <Billboard position={[1.2, 0, 0]}>
          <Text fontSize={0.3} color="red">
            X+
          </Text>
        </Billboard>
        <Billboard position={[-1.2, 0, 0]}>
          <Text fontSize={0.3} color="red">
            -X
          </Text>
        </Billboard>

        {/*  Y axis  */}
        <Line points={[[0, 0, -1], [0, 0, 1]]} color={"green"} />
        <Billboard position={[0, 0, 1.2]}>
          <Text fontSize={0.3} color="green">
            Y+
          </Text>
        </Billboard>
        <Billboard position={[0, 0, -1.2]}>
          <Text fontSize={0.3} color="green">
            -Y
          </Text>
        </Billboard>

        {/*  Z axis  */}
        <Line points={[[0, 0, 0], [0, treeHeight, 0]]} color={"blue"} />
        <Billboard position={[0, treeHeight + 0.2, 0]}>
          <Text fontSize={0.3} color="blue">
            Z+
          </Text>
        </Billboard>

        <OrbitControls maxPolarAngle={Math.PI - 1} enablePan={false} target={[0, treeHeight / 2, 0]} />
      </Canvas>

    </div >
  )

}
