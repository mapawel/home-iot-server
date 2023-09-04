import time
from pyrf24 import RF24, RF24_PA_LOW

# Ustawienia
radio = RF24(17, 0)  # CE, CSN
channel = 76
receiver_address = b'1'

# Inicjalizacja modułu radiowego
radio.begin()
radio.setPALevel(RF24_PA_LOW)  # Możesz zmienić na RF24_PA_HIGH w razie potrzeby
radio.setChannel(channel)
radio.openReadingPipe(1, receiver_address)
radio.startListening()

# Pętla nasłuchująca
try:
    while True:
        if radio.available():
            received_message = []
            radio.read(received_message, radio.getDynamicPayloadSize())
            print(f"Odebrano: {''.join(map(chr, received_message))}")
        time.sleep(1/100)  # Krótki czas oczekiwania, aby zminimalizować użycie CPU
except KeyboardInterrupt:
    print("Zakończono nasłuchiwanie")
    radio.stopListening()
