import joblib
import json
import logging
import config

logger = logging.getLogger(__name__)

class ModelLoader:
    _models = {}
    _registry = {}

    @classmethod
    def load_registry(cls):
        registry_path = config.MODEL_DIR / "registry.json"
        if registry_path.exists():
            with open(registry_path, "r", encoding="utf-8") as f:
                cls._registry = json.load(f)
            logger.info("Loaded model registry.")
        else:
            logger.warning("Model registry not found.")

    @classmethod
    def get_model(cls, model_name: str):
        if model_name not in cls._models:
            model_path = config.MODEL_DIR / model_name / "model.joblib"
            if model_path.exists():
                cls._models[model_name] = joblib.load(model_path)
                logger.info(f"Loaded model: {model_name}")
            else:
                raise FileNotFoundError(f"Model {model_name} not found at {model_path}")
        return cls._models[model_name]

    @classmethod
    def get_metadata(cls, model_name: str):
        if not cls._registry:
            cls.load_registry()
        return cls._registry.get(model_name)

# Initialize on import
ModelLoader.load_registry()
