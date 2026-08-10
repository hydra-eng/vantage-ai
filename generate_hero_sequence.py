import os
import math
from PIL import Image, ImageDraw

def generate_sequence():
    out_dir = os.path.join("public", "hero-sequence")
    os.makedirs(out_dir, exist_ok=True)
    
    width, height = 1280, 720
    cx, cy = width / 2, height / 2
    total_frames = 192
    
    print(f"Generating {total_frames} frames in {out_dir}...")
    
    for i in range(1, total_frames + 1):
        t = (i - 1) / total_frames  # 0.0 to 1.0
        angle = t * math.pi * 4     # 2 full rotations
        
        # Base dark background
        img = Image.new("RGB", (width, height), (9, 9, 11))
        draw = ImageDraw.Draw(img)
        
        # Grid lines in background
        grid_color = (25, 25, 32)
        grid_spacing = 60
        for x in range(0, width, grid_spacing):
            draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
        for y in range(0, height, grid_spacing):
            draw.line([(0, y), (width, y)], fill=grid_color, width=1)
            
        # Outer pulsating radar ring
        radar_r = 280 + math.sin(t * math.pi * 6) * 15
        draw.ellipse([cx - radar_r, cy - radar_r, cx + radar_r, cy + radar_r], outline=(30, 45, 80), width=2)
        
        # Secondary telemetry ring
        r2 = 220 + math.cos(t * math.pi * 4) * 10
        draw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], outline=(15, 98, 254), width=1)
        
        # Orbiting nodes and 3D ribbon effect
        num_nodes = 24
        nodes = []
        for n in range(num_nodes):
            phase = (n / num_nodes) * math.pi * 2 + angle
            # 3D Lissajous curve / Torus knot projection
            r3d = 180 + 40 * math.sin(3 * phase)
            x3d = cx + r3d * math.cos(phase) * math.cos(angle * 0.5)
            y3d = cy + r3d * math.sin(phase) + 30 * math.cos(2 * phase + angle)
            z3d = math.sin(phase + angle) # depth factor
            nodes.append((x3d, y3d, z3d))
            
        # Draw connecting line ribbon between 3D nodes
        for k in range(len(nodes)):
            n1 = nodes[k]
            n2 = nodes[(k + 1) % len(nodes)]
            line_col = (15, 98, 254) if k % 2 == 0 else (56, 189, 248)
            draw.line([(n1[0], n1[1]), (n2[0], n2[1])], fill=line_col, width=2)
            
        # Draw nodes & telemetry pulse dots
        for k, (nx, ny, nz) in enumerate(nodes):
            node_r = 4 + int(3 * (nz + 1))
            glow_r = node_r + 4
            draw.ellipse([nx - glow_r, ny - glow_r, nx + glow_r, ny + glow_r], fill=(15, 98, 254))
            draw.ellipse([nx - node_r, ny - node_r, nx + node_r, ny + node_r], fill=(244, 244, 245))
            
        # Center core reactor
        core_r = 35 + math.sin(t * math.pi * 8) * 5
        draw.ellipse([cx - core_r, cy - core_r, cx + core_r, cy + core_r], fill=(15, 98, 254))
        draw.ellipse([cx - (core_r - 8), cy - (core_r - 8), cx + (core_r - 8), cy + (core_r - 8)], fill=(56, 189, 248))
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(255, 255, 255))

        # Floating telemetry particle stream
        num_particles = 30
        for p in range(num_particles):
            p_angle = (p / num_particles) * math.pi * 2 + angle * 1.5
            p_dist = 100 + ((p * 17 + i * 5) % 300)
            px = cx + p_dist * math.cos(p_angle)
            py = cy + p_dist * math.sin(p_angle) * 0.6
            p_sz = 2 + (p % 3)
            draw.ellipse([px - p_sz, py - p_sz, px + p_sz, py + p_sz], fill=(56, 189, 248))

        # Save frame with padded filename ezgif-frame-XXX.jpg
        fn = f"ezgif-frame-{i:03d}.jpg"
        fp = os.path.join(out_dir, fn)
        img.save(fp, "JPEG", quality=85)

    print(f"Done generating {total_frames} frames!")

if __name__ == "__main__":
    generate_sequence()
