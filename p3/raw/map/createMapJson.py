#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil

# ================================================================================

arrayMax = 20

# 所有map txm的数据，mapdata[场景(从0开始)][地图(从0开始)]
mapdata = [1] * arrayMax

def readFile(filePath):
    fp = None
    d = ""
    try:
        fp = open(filePath, "r")
        d = fp.read()

    except Exception, e:
        print("read " + filePath + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp: fp.close()

    if d == "":
        print("read " + filePath + " no res! ")
    return d

# 先获取所有tmx的数据 
# 文件以scene_m_n.tmx的形式命名
def getTMXFiles(path):
    fList = os.listdir(path)
    for f in fList:
        fileInfos = os.path.splitext(f)
        if fileInfos[1] == '.tmx':
            d = readFile(path + f)
            indexs = fileInfos[0].split("_")
            i = int(indexs[1])
            j = int(indexs[2]) - 1
            if mapdata[i] == 1:
                mapdata[i] = [1] * arrayMax

            mapdata[i][j] = d

# ================================================================================

# 转换后的json数据 jsonDataList[场景]
jsonDataList = []

# 场景数据
sceneHeroData = []
sceneDoorData = {}
sceneSpineData = []

# area数据
noEnemyPosData = {}
doorIndexs = {} # 每个area中的door索引

# 去掉碰撞层的影响
def parseTe(t):
    if t > 256:
        return t - 256
    else:
        return t

# 解析标记
def parseNo(t, lineNum, colNum, w, h, area):

    global sceneHeroData
    global sceneDoorData
    global sceneSpineData

    global noEnemyPosData
    global doorIndexs

    if t == 38:
        noEnemyPosData[colNum * 1000 + lineNum] = 1

    elif t == 49:
        #hero pos

        thisHeroData = {}
        thisHeroData["x"] = colNum
        thisHeroData["y"] = lineNum
        thisHeroData["area"] = area
        thisHeroData["id"] = t
        sceneHeroData.append(thisHeroData)

    elif 50 <= t and t <= 64:
        # 门
        key = 1

        if not doorIndexs.has_key(t):
            doorIndexs[t] = 1
        else:
            doorIndexs[t] += 1

        orient = 0
        if lineNum == 0:
            orient = 1
        elif lineNum == h - 1:
            orient = 2
        elif colNum == 0:
            orient = 3
        elif colNum == w - 1:
            orient = 4
        else:
            orient = 5 # 在中间的门

        newT = key * 100000 + orient * 10000 + doorIndexs[t] * 100 + t

        thisDoorData = {}
        thisDoorData["x"] = colNum
        thisDoorData["y"] = lineNum
        thisDoorData["area"] = area
        thisDoorData["id"] = newT

        if not sceneDoorData.has_key(t):
            sceneDoorData[t] = {}

        if not sceneDoorData[t].has_key(doorIndexs[t]):
            sceneDoorData[t][doorIndexs[t]] = []

        sceneDoorData[t][doorIndexs[t]].append(thisDoorData)

    elif t == 65:
        # spine
        thisSpineData = {}
        thisSpineData["x"] = colNum
        thisSpineData["y"] = lineNum
        thisSpineData["area"] = area
        thisSpineData["id"] = t - 49

        if not sceneSpineData[area]:
            sceneSpineData[area] = []

        sceneSpineData[area].append(thisSpineData)


def getDataFromTileJson(jsonStr, key):
    k1 = "<layer name=\"" + key + r"\"([\s\S]*?)</layer>"
    k2 = r"<data encoding=\"csv\">\n([\s\S]*?)\n</data>"
    subStr = re.findall(k1, jsonStr)[0]
    subStr = re.findall(k2, subStr)[0]
    lineStrs = subStr.split("\n")
    tilelist = []
    for line in lineStrs:
        tileData = line.split(",")
        tileLineList = []
        for tileStr in tileData:
            if len(tileStr) < 1: continue
            tile = int(tileStr)
            tileLineList.append(tile)

        tilelist.append(tileLineList)

    return tilelist

def getIndex(x, y):
    return x * 1000 + y

# 解析对应的场景的区域 {w h te co}
# 顺便解析了其他的数据：
# param string 一个区域的数据文本
# param areaIndex 区域索引 从1开始
def parseHome(string, areaIndex):
    global sceneHeroData
    global sceneDoorData

    global doorIndexs

    doorIndexs = {}

    data = {}

    # 获取宽高
    wStr = re.findall(r" width=\"(.+?)\"", string)[0]
    hStr = re.findall(r" height=\"(.+?)\"", string)[0]
    w = int(wStr)
    h = int(hStr)
    data["w"] = w
    data["h"] = h

    # 从json string提取tile数据
    teList = getDataFromTileJson(string, "terrain") # 地形
    coList = getDataFromTileJson(string, "collision") # 碰撞
    noList = getDataFromTileJson(string, "notation") # 标记

    # 遍历标记，获取门等信息
    for j in xrange(0, len(noList)):
        noLine = noList[j]
        for i in xrange(0, len(noLine)):
            noData = noLine[i]
            parseNo(noData, j, i, w, h, areaIndex)

    realTeList = []
    for line in teList:
        realLine = []
        for tdata in line:
            realLine.append(parseTe(tdata))
        realTeList.append(realLine)

    data["te"] = realTeList
    data["co"] = coList

    return data

# 解析对应的场景的区域 {w h noeps fi[ {x y w h te co d[] } ] r }
# 顺便解析了其他的数据：
# param string 一个区域的数据文本
# param areaIndex 区域索引 从1开始
def parse(string, areaIndex):

    global sceneHeroData
    global sceneDoorData
    global sceneSpineData 

    global noEnemyPosData
    global doorIndexs

    noEnemyPosData = {}
    doorIndexs = {}

    data = {}

    # 获取宽高
    wStr = re.findall(r" width=\"(.+?)\"", string)[0]
    hStr = re.findall(r" height=\"(.+?)\"", string)[0]
    w = int(wStr)
    h = int(hStr)
    data["w"] = w
    data["h"] = h

    # 从json string提取tile数据
    teList = getDataFromTileJson(string, "terrain") # 地形
    coList = getDataFromTileJson(string, "collision") # 碰撞
    noList = getDataFromTileJson(string, "notation") # 标记

    # 遍历标记，获取无敌人区域，门，spine等信息
    for j in xrange(0, len(noList)):
        noLine = noList[j]
        for i in xrange(0, len(noLine)):
            noData = noLine[i]
            parseNo(noData, j, i, w, h, areaIndex)

    data["noeps"] = noEnemyPosData

    # 遍历碰撞，获取随机区域和固定区域
    interval = 3
    rx = 1
    ry = 0
    xLen = w - 2
    yLen = h - 1

    rList = [] # 随机区域标记

    while True:
        if ry >= yLen:
            break

        rLine = []
        _x = rx
        while True:
            if _x > xLen:
                break

            # 开始 =======================================

            # 获取位置元素
            coData = coList[ry][_x]
            # 查看是否是随机块
            if coData == 33:
                rLine.append(0)
            else:
                rLine.append(1)

            # 结束 =======================================
            _x += interval


        rList.append(rLine)
        ry += interval

    # 根据rList中记录的固定区域，记录固定区域相关信息
    fi = [] # [ {x y w h te co d[] } ]
    used = {} # 已用过的区域

    rListLen = len(rList)
    for rLineIndex in xrange(0, rListLen):
        rLine = rList[rLineIndex]
        rLineLen = len(rLine)
        for rDataIndex in xrange(0, rLineLen):
            rData = rLine[rDataIndex]
            if rData == 1 and not used.has_key(getIndex(rDataIndex, rLineIndex)):
                # 查看大小
                fiY = rLineIndex
                fiX = rDataIndex

                while True: # 看宽度
                    if fiX + 1 >= rLineLen or rLine[fiX + 1] != 1:
                        break
                    fiX += 1

                while True: # 看高度
                    if fiY + 1 >= rListLen or rList[fiY + 1][fiX] != 1:
                        break
                    fiY += 1

                # 记录到“已用过的区域”
                for y in xrange(rLineIndex, fiY + 1):
                    for x in xrange(rDataIndex, fiX + 1):
                        used[getIndex(x, y)] = 1

                realY = rLineIndex * interval
                realYMax = (fiY + 1) * interval
                realX = rDataIndex * interval + 1
                realXMax = (fiX + 1) * interval + 1

                realW = realXMax - realX
                realH = realYMax - realY

                #靠边的块要加上边缘
                if realX == 1:
                    realX = 0
                    realW += 1

                if realXMax == w - 1:
                    realW += 1

                if realYMax == h - 1:
                    realH += 1

                oneFi = {}

                # 基础属性
                oneFi["x"] = realX
                oneFi["y"] = realY
                oneFi["w"] = realW
                oneFi["h"] = realH

                # 区域的地形和碰撞
                fite = []
                fico = []

                for y in xrange(realY, realY + realH):
                    fiteLine = []
                    ficoLine = []

                    for x in xrange(realX, realX + realW):
                        fiteData = parseTe(teList[y][x])
                        ficoData = coList[y][x]
                        fiteLine.append(fiteData)
                        ficoLine.append(ficoData)

                    fite.append(fiteLine)
                    fico.append(ficoLine)

                oneFi["te"] = fite
                oneFi["co"] = fico

                # 区域的门信息
                doorUp = []
                doorDown = []
                doorLeft = []
                doorRight = []

                doorNotation = [34, 35, 36, 37]
                for thumbY in xrange(rLineIndex, fiY + 1):
                    y = thumbY * interval
                    for thumbX in xrange(rDataIndex, fiX + 1):
                        x = thumbX * interval + 1

                        # 上下左右
                        if y - 1 >= 0 and noList[y - 1][x] in doorNotation:
                            doorUp.append([x, y])

                        if y + 3 < h - 1 and noList[y + 3][x] in doorNotation:
                            doorDown.append([x, y + 2])

                        if x - 1 >= 1 and noList[y][x - 1] in doorNotation:
                            doorLeft.append([x - 1, y])

                        if x + 3 < w - 2 and noList[y][x + 3] in doorNotation:
                            doorRight.append([x + 2, y])

                door = []
                door.append(doorUp)
                door.append(doorDown)
                door.append(doorLeft)
                door.append(doorDown)
                oneFi["d"] = door

                fi.append(oneFi)


    data["r"] = rList
    data["fi"] = fi

    return data

# 获取对应场景的attri
attriJson = None
def readAttriJson(sceneIndex):
    global attriJson

    if not attriJson:
        with open("./mapAttri.json", 'r') as load_f:
            attriJson = json.load(load_f)

    return attriJson[sceneIndex]

# 解析mapData
def parseData():
    global sceneHeroData
    global sceneDoorData
    global sceneSpineData

    sceneIndex = 0 # 0是home，要特殊处理
    for scenedata in mapdata:
        if scenedata == 1:
            break

        if sceneIndex == 0:
            dataList = []
            sceneHeroData = []
            sceneDoorData = {}

            areaIndex = 1
            for areadata in scenedata:
                if areadata == 1:
                    break

                print "parse home scene {} area {}".format(sceneIndex, areaIndex)
                data = parseHome(areadata, areaIndex)
                dataList.append(data)
                areaIndex = areaIndex + 1

            data = {}
            data["areas"] = dataList
            data["heros"] = sceneHeroData
            data["gates"] = sceneDoorData

            jsonDataList.append(data)

        else:
            dataList = []
            sceneHeroData = []
            sceneDoorData = {}
            sceneSpineData = []

            areaIndex = 1
            for areadata in scenedata:
                if areadata == 1:
                    break

                print "parse scene {} area {}".format(sceneIndex, areaIndex)
                data = parse(areadata, areaIndex)
                dataList.append(data)
                areaIndex = areaIndex + 1

            data = {}
            data["areas"] = dataList
            data["heros"] = sceneHeroData
            data["gates"] = sceneDoorData
            data["spines"] = sceneSpineData
            data["attri"] = readAttriJson(sceneIndex - 1)

            jsonDataList.append(data)

        sceneIndex += 1

# ================================================================================

total = 0

def encrypt(obj):
    global total

    if isinstance(obj, int):
        total += obj

    elif isinstance(obj, dict):
        for sub in obj.values():
            encrypt(sub)

    elif isinstance(obj, list):
        for sub in obj:
            encrypt(sub)
    

def saveEncryptInfo(path):
    global total
    
    encryptTotal = []
    for jsonData in jsonDataList:
        total = 0

        encrypt(jsonData)

        encryptTotal.append(total)

    jsonStr = json.dumps(encryptTotal)
    jsStr = "module.exports = " + jsonStr + ";"

    realPath = path
    if not os.path.exists(realPath):
        os.makedirs(realPath)

    realFile = realPath + "MapCheck.js"
    saveFile(realFile, jsStr)

# ================================================================================

def saveFile(path, data):
    fp = None
    try:
        fp = open(path, "w")
        fp.write(data)

    except Exception, e:
        print("save " + path + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp: fp.close()

def saveJsonAndImg(path, oldPath):
    index = 0
    for jsonData in jsonDataList:
        jsonStr = json.dumps(jsonData)

        realPath = path + "scene" + str(index) + "/"
        if not os.path.exists(realPath):
            os.makedirs(realPath)

        realFile = realPath + "area.json"
        saveFile(realFile, jsonStr)

        oldImgName = oldPath + "scene_" + str(index) + ".png"
        newImgName = realPath + "tiles.png"
        shutil.copyfile(oldImgName, newImgName)

        index += 1

# ================================================================================

if '__main__' == __name__:
    path = "./"
    # outPath = "../assets/resources/map/"
    outPath = "./output/"
    getTMXFiles(path)
    parseData()
    saveEncryptInfo(outPath)
    saveJsonAndImg(outPath, path)
    print "finish at: " + outPath





