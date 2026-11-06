from datasets import load_dataset

# Memuat subset bahasa Indonesia (id) dari GigaSpeech 2
# Streaming=True sangat disarankan agar tidak membebani RAM/Storage lokal
dataset = load_dataset("speechcolab/gigaspeech2", "id", split="train", streaming=True)

# Contoh mengambil beberapa sampel data audio & teks
for sample in dataset:
    print(sample)
    break