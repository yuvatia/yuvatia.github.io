from PIL import Image

def convert_ico_to_png(ico_file_path, output_dir):
    # Open the ICO file
    ico_image = Image.open(ico_file_path)
    
    # Extract the desired sizes
    sizes = [(192, 192), (512, 512)]
    
    # Iterate over sizes and save as PNG
    for size in sizes:
        # Resize the image
        resized_image = ico_image.resize(size, Image.ANTIALIAS)
        
        # Construct the output file path
        output_file_path = f"{output_dir}/logo{size[0]}.png"
        
        # Save the resized image as PNG
        resized_image.save(output_file_path, "PNG")
        print(f"Saved {output_file_path}")

# Example usage
ico_file_path = "favicon.ico"
output_directory = "."
convert_ico_to_png(ico_file_path, output_directory)
