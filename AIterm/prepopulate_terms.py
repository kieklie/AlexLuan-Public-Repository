"""
Pre-populate 100 hot AI terms into the database cache.
"""
import asyncio
import sys
import os

# 获取脚本所在目录的绝对路径
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

import agent as agent_module
import storage

# 100 hot AI terminology words
AI_TERMS = [
    # Foundation Models & Architectures
    "Transformer", "BERT", "GPT", "GPT-4", "LLaMA", "LLaMA 2", "LLaMA 3",
    "Claude", "Gemini", "PaLM", "T5", "Flan-T5", "mT5", "Chinchilla",
    "Gopher", "Mistral", "Mixtral", "Qwen", "Baichuan", "Yi",

    # Language Model Techniques
    "RLHF", "PPO", "DPO", "CoT", "Chain-of-Thought", "Prompt Engineering",
    "Few-shot Learning", "Zero-shot Learning", "In-context Learning",
    "Fine-tuning", "LoRA", "QLoRA", "Adapter", "Prefix Tuning", "Prompt Tuning",
    "Knowledge Distillation", "Model Compression", "Quantization", "AWQ", "GPTQ",

    # Multimodal
    "CLIP", "DALL-E", "DALL-E 3", "Stable Diffusion", "Midjourney", "SDXL",
    "Sora", "VideoGen", "ImageGen", "Text-to-Speech", "Speech-to-Text",
    "Whisper", "Gemini Pro Vision", "GPT-4V", "LLaVA", "MiniGPT-4",

    # AI Safety & Alignment
    "Alignment", "AI Safety", "Interpretability", "Mechanistic Interpretability",
    "Superposition", "Feature Extraction", "Circuit Analysis", "Toy Models",
    "Constitutional AI", "RAIL", "ELK", "Ablation", "Activation",

    # ML Fundamentals
    "Attention", "Self-Attention", "Multi-Head Attention", "Cross-Attention",
    "Scaled Dot-Product", "Positional Encoding", "Layer Norm", "Batch Norm",
    "Dropout", "Residual Connection", "Feed Forward", "Embedding",
    "Token", "Tokenizer", "BPE", "WordPiece", "SentencePiece",

    # Architectures
    "CNN", "RNN", "LSTM", "GRU", "ResNet", "ViT", "Swin Transformer",
    "U-Net", "GAN", "VAE", "Diffusion Model", "Flow Model",
    "Mamba", "State Space Model", "SSM", "RWKV",

    # Evaluation & Benchmarks
    "MMLU", "BIG-Bench", "HELM", "HumanEval", "MBPP", "GSM8K", "MATH",
    "ARC", "HellaSwag", "TruthfulQA", "OpenBookQA", "SWE-bench",

    # Search & Retrieval
    "RAG", "Retrieval Augmented Generation", "Vector Database", "Embedding Model",
    "FAISS", "Pinecone", "Weaviate", "Chroma", "Semantic Search",

    # Agents & Tools
    "AutoGPT", "BabyAGI", "Agent", "Tool Use", "Function Calling",
    "Web Search", "Browser Agent", "ReAct", "Reflexion", "Self-Refine",

    # Training & Infrastructure
    "Gradient Descent", "Adam", "AdamW", "Learning Rate", "Warmup",
    "Batch Size", "Epoch", "Checkpoint", "Mixed Precision", "Flash Attention",
    "Distributed Training", "Data Parallel", "Model Parallel", "ZeRO",

    # Concepts & Paradigms
    "AGI", "ASI", "Narrow AI", "General AI", "Symbolic AI",
    "Connectionist", "Neuro-symbolic", "Emergent Behavior", "Scaling Law",
    "Hoffmeyer", "Inner Simulator", "Global Workspace",

    # Prompting
    "System Prompt", "Temperature", "Top-p", "Max Tokens", "Stop Sequence",
]


async def populate_term(term: str, session_id: str) -> bool:
    """Query a term and cache the result."""
    try:
        result = await agent_module.agent.chat(session_id, f"解释 {term} 这个术语")
        print(f"  [OK] {term}")
        return True
    except Exception as e:
        print(f"  [FAIL] {term}: {e}")
        return False


async def main():
    print("Creating session...")
    session_id = storage.storage.create_session()
    print(f"Session: {session_id}")
    print(f"Pre-populating {len(AI_TERMS)} terms...\n")

    success = 0
    failed = []

    for i, term in enumerate(AI_TERMS, 1):
        print(f"[{i}/{len(AI_TERMS)}] Processing: {term}")
        ok = await populate_term(term, session_id)
        if ok:
            success += 1
        else:
            failed.append(term)
        # Small delay to avoid rate limiting
        if i % 10 == 0:
            await asyncio.sleep(1)

    print(f"\n{'='*50}")
    print(f"Completed: {success}/{len(AI_TERMS)}")
    if failed:
        print(f"Failed terms: {', '.join(failed)}")

    # Verify cache
    print(f"\nCache contains {len(AI_TERMS)} terms")
    cached = storage.storage.get_cached_reply("transformer")
    if cached:
        print(f"Sample cache entry for 'transformer': {cached[:100]}...")


if __name__ == "__main__":
    asyncio.run(main())