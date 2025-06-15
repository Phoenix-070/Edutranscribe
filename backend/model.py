from huggingface_hub import hf_hub_download
import os

# Constants
REPO_ID = "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF"
FILENAME = "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
DEST_DIR = "D:/models"

# Create the folder if it doesn't exist
os.makedirs(DEST_DIR, exist_ok=True)

# Download the model directly into the destination
model_path = hf_hub_download(
    repo_id=REPO_ID,
    filename=FILENAME,
    local_dir=DEST_DIR,
    local_dir_use_symlinks=False
)

print(f"✅ Model downloaded successfully to: {model_path}")
