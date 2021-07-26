import frida
import sys
import codecs
import threading
device=frida.get_device_manager().enumerate_devices()[-1]

js=open("./agent.js","r+")
jscode=js.read()
js.close()

pending=[]
sessions=[]
scripts=[]

event=threading.Event()


def on_spawned(spawn):
    pending.append(spawn)
    event.set()

def spawn_added(spawn):
    pass

