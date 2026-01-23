"""
Convert HEIC and JPG files to PNG format.
Usage: python convert_images.py
"""

import os
from pathlib import Path
from PIL import Image
import pillow_heif


def convert_images(source_dir: str) -> None:
    """Convert all HEIC and JPG files in source_dir to PNG format."""
    source_path = Path(source_dir)
    
    pillow_heif.register_heif_opener()
    
    for file in source_path.iterdir():
        if not file.is_file():
            continue
            
        suffix_lower = file.suffix.lower()
        
        if suffix_lower in ('.heic', '.heif'):
            output_path = file.with_suffix('.png')
            print(f"Converting HEIC: {file.name} -> {output_path.name}")
            img = Image.open(file)
            img.save(output_path, 'PNG')
            img.close()
            
        elif suffix_lower in ('.jpg', '.jpeg'):
            output_path = file.with_suffix('.png')
            print(f"Converting JPG: {file.name} -> {output_path.name}")
            img = Image.open(file)
            img.save(output_path, 'PNG')
            img.close()

    print("Conversion complete!")


if __name__ == "__main__":
    images_dir = Path(__file__).parent / "websiteimages"
    convert_images(str(images_dir))
