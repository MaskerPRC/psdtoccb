import sys
import os
import shutil
import os,sys

def Red(str):
    return "\033[31m%s\033[0m"%(str)
def Orange(str):
    return "\033[33m%s\033[0m"%(str)
def Purple(str):
    return "\033[35m%s\033[0m"%(str)
def Green(str):
    return "\033[32m%s\033[0m"%(str)

TexturePackerPath = "/TexturePacker.app/Contents/MacOS/TexturePacker"
folder = ""
def CheckTexturePacker():
    if not os.path.exists(folder+TexturePackerPath):
        print(1)
        exit(-1)

def TexturePackerPack(fullpath, outputPlist, maxSize):
    if not outputPlist:
        outputPlist = "/dev/null"
        outputPng = "/dev/null"
        redirPipe = "1>/dev/null 2>&1"
    else:
        outputPng = outputPlist.replace(".plist", ".png")
        redirPipe = ""
    cmd = (folder+TexturePackerPath + " --smart-update " + \
        "--texture-format png " + \
        "--format cocos2d " + \
        "--data \"%s\" " + \
        "--sheet \"%s\" " + \
        "--algorithm MaxRects " + \
        "--maxrects-heuristics best " + \
        "--enable-rotation " + \
        "--scale 1 " + \
        "--shape-padding 2 " + \
        "--border-padding 2 " + \
        "--max-size %d " + \
        "--opt RGBA8888 " + \
        "--trim " + \
        "--size-constraints AnySize " + \
        "\"%s\"/*.png %s") \
        %(outputPlist, outputPng, maxSize, fullpath, redirPipe)
    ret = os.system(cmd)
    return ret >> 8

def GetMaxSizeOfTexture(fullpath):
    sizeArray = [256, 512, 1024, 2048]
    for size in sizeArray:
        ret = TexturePackerPack(fullpath, None, size)
        if ret == 0:
            return size

def PackTextureToPlist(fullpath):
    size = GetMaxSizeOfTexture(fullpath)
    if not size:
        exit(-1)
    parentPath, dirName = os.path.split(fullpath)
    outputPlist = os.path.join(parentPath, dirName + ".plist")
    ret = TexturePackerPack(fullpath, outputPlist, size)
    return ret

def CheckFolder(fullpath):
    for name in os.listdir(fullpath):
        path = os.path.join(fullpath, name)
        if os.path.isdir(path):
            if name.startswith("."): continue
            exit(-1)
        else:
            if name.startswith("."):
                os.remove(path) #删除隐藏临时文件
            elif not name.endswith(".png"):
                exit(-1)
            elif " " in name:
                exit(-1)

if __name__ == "__main__":
    fullpath = sys.argv[1]
    folder = sys.argv[2]
    CheckTexturePacker()
    CheckFolder(fullpath)
    ret = PackTextureToPlist(fullpath)
    if ret == 0 :
        shutil.rmtree(fullpath)


