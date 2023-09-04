import sys
import argparse
import time
import struct
from pyrf24 import RF24, RF24_PA_LOW

radio = RF24(17, 0)  # CE, CSN
channel = 76
receiver_address = b'1'

if not radio.begin():
    raise OSError("nRF24L01 hardware isn't responding")

radio.set_pa_level(RF24_PA_LOW)  # RF24_PA_MAX is default
radio.open_rx_pipe(1, receiver_address)  # using pipe 1
radio.print_details()
radio.setChannel(channel)

radio.listen = True

try:
    while True:
        if radio.available():
            has_payload, pipe_number = radio.available_pipe()
            if has_payload:
                length = radio.payload_size  # grab the payload length
                # fetch 1 payload from RX FIFO
                received = radio.read(length)  # also clears radio.irq_dr status flag
                # expecting a little endian float, thus the format string "<f"
                # received[:4] truncates padded 0s in case dynamic payloads are disabled
                payload[0] = struct.unpack("<f", received[:4])[0]
                # print details about the received packet
                print(f"Received {length} bytes on pipe {pipe_number}: {payload[0]}")
                start = time.monotonic()  # reset the timeout timer

except KeyboardInterrupt:
    print("Zakończono nasłuchiwanie")
    radio.stopListening()
