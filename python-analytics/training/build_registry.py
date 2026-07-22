import os
import json
import logging
import config

logger = logging.getLogger(__name__)

def build_model_registry():
    logger.info("Building Model Registry")
    registry = {}
    
    if not config.MODEL_DIR.exists():
        logger.warning("Model directory does not exist.")
        return

    for model_dir in config.MODEL_DIR.iterdir():
        if model_dir.is_dir():
            metadata_file = model_dir / "metadata.json"
            if metadata_file.exists():
                try:
                    with open(metadata_file, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                    
                    model_name = model_dir.name
                    registry[model_name] = {
                        "version": metadata.get("version", "1.0.0"),
                        "algorithm": metadata.get("algorithm", "Unknown"),
                        "trainedAt": metadata.get("trainedAt"),
                        "features": metadata.get("features", []),
                        "metrics": f"{model_name}/metrics.json"
                    }
                except Exception as e:
                    logger.error(f"Error reading metadata for {model_dir.name}: {e}")
                    
    registry_file = config.MODEL_DIR / "registry.json"
    with open(registry_file, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
        
    logger.info(f"Model Registry built with {len(registry)} models.")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    build_model_registry()
