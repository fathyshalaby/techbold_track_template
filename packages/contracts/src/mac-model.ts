// Mac dev stack: trained adapter served via MLX on Apple Silicon.
export const MAC_MLX_PORT = 8011;
export const MAC_MLX_HOST = "127.0.0.1";
export const MAC_MLX_BASE_URL = `http://${MAC_MLX_HOST}:${MAC_MLX_PORT}/v1`;
export const MAC_MLX_MODEL_ID = "mlx-community/Qwen2.5-1.5B-Instruct-4bit";
export const MAC_MODEL_TRAIN_CMD = "bun run model:train";
export const MAC_MODEL_SERVE_CMD = "bun run model:serve";
