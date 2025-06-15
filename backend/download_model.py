import os
import requests
from tqdm import tqdm
import sys

def download_file(url, filename):
    """
    Download a file with progress bar and improved error handling
    """
    try:
        # Set larger timeout and chunk size for large files
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()  # Raise error for bad status codes
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 8192  # 8 KB chunks for better performance
        
        # Check if file is partially downloaded
        initial_pos = 0
        mode = 'wb'
        if os.path.exists(filename):
            initial_pos = os.path.getsize(filename)
            if initial_pos < total_size:
                mode = 'ab'  # Resume download
                headers = {'Range': f'bytes={initial_pos}-'}
                response = requests.get(url, stream=True, headers=headers, timeout=30)
            else:
                print(f"\nFile already exists and is complete at {filename}")
                return

        progress_bar = tqdm(
            total=total_size,
            initial=initial_pos,
            unit='iB',
            unit_scale=True,
            desc="Downloading"
        )

        with open(filename, mode) as file:
            for data in response.iter_content(block_size):
                if data:  # Filter out keep-alive chunks
                    progress_bar.update(len(data))
                    file.write(data)
        
        progress_bar.close()
        
        # Verify file size after download
        if os.path.getsize(filename) != total_size:
            raise Exception("Downloaded file size does not match expected size")
            
    except requests.exceptions.RequestException as e:
        print(f"\nNetwork error occurred: {str(e)}")
        print("Try running the script again to resume the download.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError during download: {str(e)}")
        print("Try running the script again to resume the download.")
        sys.exit(1)

def main():
    try:
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(models_dir, exist_ok=True)

        # Model URL from TheBloke's GGUF models
        model_url = "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf"
        model_path = os.path.join(models_dir, "llama-2-7b-chat.Q4_K_M.gguf")

        print("\nStarting Llama-2-7B-Chat model download")
        print(f"Download location: {model_path}")
        print("File size: ~4GB - This may take a while depending on your internet connection")
        print("The download can be resumed if interrupted\n")
        
        download_file(model_url, model_path)
        
        if os.path.exists(model_path):
            print("\n✓ Model downloaded successfully!")
            print(f"✓ Model saved to: {model_path}")
            
            # Update the model path in main.py
            main_py_path = os.path.join(os.path.dirname(__file__), "main.py")
            with open(main_py_path, 'r') as file:
                content = file.read()
            
            # Replace the model path
            new_content = content.replace(
                'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
                'llama-2-7b-chat.Q4_K_M.gguf'
            )
            
            with open(main_py_path, 'w') as file:
                file.write(new_content)
            
            print("✓ Updated model path in main.py")
            print("\nYou can now restart the application to use the new model")
            
        else:
            print("\n⚠️ Download appears incomplete. Please run the script again to resume.")
            
    except Exception as e:
        print(f"\n⚠️ Error in main process: {str(e)}")
        print("Please run the script again to retry.")
        sys.exit(1)

if __name__ == "__main__":
    main()
