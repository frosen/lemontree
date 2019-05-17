#!/usr/bin/python
# coding:utf-8

import json
import os
import re
import shutil
import math
import copy
import sys

# 常量 ================================================================================

arrayMax = 20

clsnSize = 256  # 碰撞层瓦块的总数

tileGateFrom = 65
tileGateTo = 80
tileRandom = 40
tileDoorUp = 41
tileDoorDown = 42
tileDoorLeft = 43
tileDoorRight = 44
tileDoors = [tileDoorUp, tileDoorDown, tileDoorLeft, tileDoorRight]
tileNoEnemy = 45

tileMoveFrom = 49
tileRightMove = 49
tileLeftMove = 50
tileJump = 51
tileUpMove = 52
tileMoveTo = 52

tileSpineFrom = 53
tileSpine = 53
tileSpineTo = 64

tileHero = 81

thumbInterval = 3

RThumb = 0  # 随机大块
FiThumb = 1  # 固定大块

# 功能方法 ================================================================================


def readFile(filePath):
    fp = None
    d = ""
    try:
        fp = open(filePath, "r")
        d = fp.read()

    except Exception, e:
        print("read " + filePath + " exception! " +
              str(Exception) + ":" + str(e))

    finally:
        if fp:
            fp.close()

    if d == "":
        print("read " + filePath + " no res! ")
    return d


def saveFile(path, data):
    fp = None
    try:
        fp = open(path, "w")
        fp.write(data)

    except Exception, e:
        print("save " + path + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp:
            fp.close()


def addArray(array, length):
    while True:
        if len(array) <= length:
            array.append([])
        else:
            break


def getWHFromTileJson(jsonStr):
    wStr = re.findall(r" width=\"(.+?)\"", jsonStr)[0]
    hStr = re.findall(r" height=\"(.+?)\"", jsonStr)[0]
    w = int(wStr)
    h = int(hStr)
    return w, h


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
            if len(tileStr) < 1:
                continue
            tile = int(tileStr)
            tileLineList.append(tile)

        tilelist.append(tileLineList)

    return tilelist


# 得到一个块的最下的中点
TileLength = 32


def getPX(x):
    return int(x * TileLength + TileLength * 0.5)


def getPY(y, h):
    return int(h - y - 1) * TileLength


class MapCreator:
    def createMap(self):
        path = "./map/"
        # outPath = "../assets/resources/map/"
        outPath = "./map/output/"

        print "go to create map json"

        self.initMapStrData()
        self.getStrDataFromMapTMXFiles(path)
        self.parseMapStrData()
        self.saveJsonAndImg(outPath, path)
        print "finish at: " + outPath

    def initMapStrData(self):
        # 所有map txm的数据，mapdata[场景(从0开始，0是home)][地图(从0开始)]
        self.mapStrData = [[]] * arrayMax

        # 所有地图的类型 [场景(从0开始，0是home)][地图(从0开始)]
        self.mapType = [[]] * arrayMax

        # 转换后的json数据 jsonDataList[场景]
        self.jsonDataList = []

        # 场景属性
        self.attriJson = None

    # 先获取所有tmx的数据
    # 文件以scene_m_n.tmx的形式命名
    def getStrDataFromMapTMXFiles(self, path):
        fList = os.listdir(path)
        for f in fList:
            fileInfos = os.path.splitext(f)
            if fileInfos[1] == '.tmx':
                d = readFile(path + f)
                indexs = fileInfos[0].split("_")
                if indexs[0] != "scene":
                    continue

                i = int(indexs[1])
                j = int(indexs[2]) - 1

                if len(self.mapStrData[i]) == 0:
                    self.mapStrData[i] = [None] * arrayMax
                self.mapStrData[i][j] = d

                if len(self.mapType[i]) == 0:
                    self.mapType[i] = [0] * arrayMax  # 普通类型为0
                # scene有可能分两个部分，那么后一部分就是advance 用1表示
                if len(indexs) == 4 and indexs[3] == "ad":
                    self.mapType[i][j] = 1

    # 解析mapData
    def parseMapStrData(self):

        sceneIndex = 0
        for sceneStrData in self.mapStrData:
            if (len(sceneStrData) == 0):
                break

            finalData = {}

            areaDataList = []
            areaTypes = []

            # 场景数据
            self.sceneHeroData = []
            self.sceneDoorData = {}
            self.sceneSpineData = []

            areaIndex = 0
            for areaStrData in sceneStrData:
                if not areaStrData:
                    break

                print "parse scene {} area {}".format(sceneIndex, areaIndex)
                if sceneIndex == 0:  # 0是home，要特殊处理
                    areaData = self.parseHome(areaStrData, areaIndex)
                else:
                    areaData = self.parse(areaStrData, areaIndex)
                areaDataList.append(areaData)
                areaTypes.append(self.mapType[sceneIndex][areaIndex])
                areaIndex = areaIndex + 1

            finalData["areaTemps"] = areaDataList
            finalData["areaTypes"] = areaTypes
            finalData["heros"] = self.sceneHeroData
            finalData["gates"] = self.sceneDoorData
            finalData["spines"] = self.sceneSpineData
            finalData["attri"] = self.readAttriJson(sceneIndex)

            self.jsonDataList.append(finalData)
            sceneIndex += 1

    # 解析对应的场景的区域 {w h te co}
    # 顺便解析了其他的数据：
    # param string 一个区域的数据文本
    # param areaIndex 区域索引 从0开始
    def parseHome(self, string, areaIndex):

        self.doorIndexs = {}

        # 获取宽高
        w, h = getWHFromTileJson(string)

        # 从json string提取tile数据
        teList = getDataFromTileJson(string, "terrain")  # 地形
        coList = getDataFromTileJson(string, "collision")  # 碰撞
        noList = getDataFromTileJson(string, "notation")  # 标记

        # 遍历标记，获取门等信息
        for j in xrange(0, len(noList)):
            noLine = noList[j]
            for i in xrange(0, len(noLine)):
                noData = noLine[i]
                self.parseNo(noData, j, i, w, h, areaIndex)

        # 遍历碰撞，获取门信息
        for j in xrange(0, len(coList)):
            coLine = coList[j]
            for i in xrange(0, len(coLine)):
                coData = coLine[i]
                newT = self.parseCo(coData, j, i, w, h, areaIndex)
                coList[j][i] = newT

        realTeList = []
        for line in teList:
            realLine = []
            for tdata in line:
                realLine.append(self.parseTe(tdata))
            realTeList.append(realLine)

        data = {}
        data["w"] = w
        data["h"] = h
        data["te"] = realTeList
        data["co"] = coList

        return data

    # 解析对应的场景的区域 {w h noeps fi[ {x y w h te co d[] } ] r }
    # 顺便解析了其他的数据：
    # param string 一个区域的数据文本
    # param areaIndex 区域索引 从0开始
    def parse(self, string, areaIndex):

        self.noEnemyPosData = []
        self.doorIndexs = {}

        # 获取宽高
        w, h = getWHFromTileJson(string)

        # 从json string提取tile数据
        teList = getDataFromTileJson(string, "terrain")  # 地形
        coList = getDataFromTileJson(string, "collision")  # 碰撞
        noList = getDataFromTileJson(string, "notation")  # 标记

        # 遍历标记，获取无敌人区域，spine等信息
        for j in xrange(0, len(noList)):
            noLine = noList[j]
            for i in xrange(0, len(noLine)):
                noData = noLine[i]
                self.parseNo(noData, j, i, w, h, areaIndex)

        # 遍历碰撞，获取门信息
        for j in xrange(0, len(coList)):
            coLine = coList[j]
            for i in xrange(0, len(coLine)):
                coData = coLine[i]
                newT = self.parseCo(coData, j, i, w, h, areaIndex)
                coList[j][i] = newT

        # 遍历碰撞，获取随机区域和固定区域
        rList = self.parseRList(coList, w, h)

        # 根据rList中记录的固定区域，记录固定区域相关信息
        fi = self.parseFi(rList, w, h, teList, coList, noList)

        data = {}
        data["rW"] = w
        data["rH"] = h
        data["noeps"] = self.noEnemyPosData
        data["ra"] = rList
        data["fis"] = fi

        return data

    # 去掉碰撞层的影响
    def parseTe(self, t):
        if t > clsnSize:
            return t - clsnSize
        else:
            return t

    # 解析标记
    def parseNo(self, t, lineNum, colNum, w, h, area):

        if t == tileNoEnemy:
            self.noEnemyPosData.append(colNum * 1000 + lineNum)

        elif t == tileHero:
            # hero pos

            thisHeroData = {}
            thisHeroData["x"] = getPX(colNum)
            thisHeroData["y"] = getPY(lineNum, h)
            thisHeroData["area"] = area
            thisHeroData["id"] = t
            self.sceneHeroData.append(thisHeroData)

    # 解析碰撞
    def parseCo(self, t, lineNum, colNum, w, h, area, xOffset=0, yOffset=0):

        keyDight = 100  # 标记的数位

        if tileGateFrom <= t and t <= tileGateTo:
            # 门
            key = 1

            if not self.doorIndexs.has_key(t):
                self.doorIndexs[t] = 1
            else:
                self.doorIndexs[t] += 1
                if self.doorIndexs[t] > 9:
                    raise Exception("door index couldn't more than 9!!")

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
                orient = 5  # 在中间的门

            # 新数据
            newT = t * 100000 + orient * 10000 + \
                self.doorIndexs[t] * 1000 + key * keyDight + 0  # 门都是可通过的

            # 门数据记录到门的列表中
            thisDoorData = {}
            thisDoorData["x"] = getPX(colNum) + xOffset
            thisDoorData["y"] = getPY(lineNum, h) + yOffset
            thisDoorData["area"] = area
            thisDoorData["id"] = newT

            if not self.sceneDoorData.has_key(t):
                self.sceneDoorData[t] = {}

            if not self.sceneDoorData[t].has_key(self.doorIndexs[t]):
                self.sceneDoorData[t][self.doorIndexs[t]] = []

            if len(self.sceneDoorData[t][self.doorIndexs[t]]) >= 2:
                raise Exception("door at ", colNum, lineNum, "wrong")

            self.sceneDoorData[t][self.doorIndexs[t]].append(thisDoorData)

            return newT

        elif tileMoveFrom <= t and t <= tileMoveTo:
            # 强制移动
            key = 2
            realTile = 0

            if t == tileRightMove:
                realTile = 1  # lly todo 强制移动用spine实现

            elif t == tileLeftMove:
                realTile = 1

            elif t == tileJump:
                realTile = 1

            elif t == tileUpMove:
                realTile = 0

            return t * 1000 + key * keyDight + realTile

        elif tileSpineFrom <= t and t <= tileSpineTo:
            key = 3
            realTile = 0

            if t == tileSpine:
                # spine
                thisSpineData = {}
                thisSpineData["x"] = getPX(colNum) + xOffset
                thisSpineData["y"] = getPY(lineNum, h) + yOffset
                thisSpineData["id"] = t - tileSpineFrom
                addArray(self.sceneSpineData, area)
                self.sceneSpineData[area].append(thisSpineData)

            return t * 1000 + key * keyDight + realTile
        else:
            return t

    # 3*3的块，左上角是随机块的就是随机，否则是固定
    def parseRList(self, coList, w, h):
        rx = 1
        ry = 0
        xLast = w - 1
        yLast = h - 1

        rList = []  # 随机区域标记

        while True:
            if ry >= yLast:
                break

            rLine = []
            _x = rx
            while True:
                if _x > xLast:
                    break

                # 开始 =======================================

                # 获取位置元素
                coData = coList[ry][_x]
                # 查看是否是随机块
                if coData == tileRandom:
                    rLine.append(RThumb)
                else:
                    rLine.append(FiThumb)

                # 结束 =======================================
                _x += thumbInterval

            rList.append(rLine)
            ry += thumbInterval

        return rList

    def parseFi(self, rList, w, h, teList, coList, noList):
        fi = []  # [ {x y w h te co d[] } ]
        used = {}  # 已用过的区域

        rListLen = len(rList)
        for rLineIndex in xrange(0, rListLen):
            rLine = rList[rLineIndex]
            rLineLen = len(rLine)
            for rDataIndex in xrange(0, rLineLen):
                rData = rLine[rDataIndex]
                if rData != FiThumb:
                    continue
                if used.has_key(self.getIndex(rDataIndex, rLineIndex)):
                    continue

                # 查看大小
                fiY = rLineIndex
                fiX = rDataIndex

                while True:  # 看宽度
                    if fiX + 1 >= rLineLen or rLine[fiX + 1] != FiThumb:
                        break
                    fiX += 1

                while True:  # 看高度
                    if fiY + 1 >= rListLen or rList[fiY + 1][fiX] != FiThumb:
                        break
                    fiY += 1

                # 记录到“已用过的区域”
                for y in xrange(rLineIndex, fiY):
                    for x in xrange(rDataIndex, fiX):
                        used[self.getIndex(x, y)] = 1

                realY = rLineIndex * thumbInterval
                realYMax = fiY * thumbInterval
                realX = rDataIndex * thumbInterval + 1
                realXMax = fiX * thumbInterval + 1

                realW = realXMax - realX
                realH = realYMax - realY

                # 靠边的块要加上边缘
                if realX == 1:
                    realX = 0
                    realW += 1

                if realXMax == w - 1:
                    realW += 1

                if realYMax == h - 1:
                    realH += 1

                oneFi = {}

                # 基础属性
                oneFi["rX"] = realX
                oneFi["rY"] = realY
                oneFi["rW"] = realW
                oneFi["rH"] = realH

                oneFi["tX"] = rDataIndex
                oneFi["tY"] = rLineIndex
                oneFi["tW"] = fiX + 1 - rDataIndex
                oneFi["tH"] = fiY + 1 - rLineIndex

                # 区域的地形和碰撞
                fite = []
                fico = []

                for y in xrange(realY, realY + realH):
                    fiteLine = []
                    ficoLine = []

                    for x in xrange(realX, realX + realW):
                        te = teList[y][x]
                        fiteData = self.parseTe(te)
                        ficoData = coList[y][x]
                        fiteLine.append(fiteData)
                        ficoLine.append(ficoData)

                    fite.append(fiteLine)
                    fico.append(ficoLine)

                oneFi["te"] = fite
                oneFi["co"] = fico

                # 区域的门信息
                doorUp = []  # 记录九宫格的左上角
                doorDown = []  # 记录九宫格的左下角
                doorLeft = []  # 记录九宫格的左上角
                doorRight = []  # 记录九宫格的右上角
                substitutes = [0, 1, 2, 3]  # 不通方向的替代，默认0-3就是上下左右，也就是不用替代

                doorNotation = tileDoors
                FiY = -1
                for thumbY in xrange(rLineIndex, fiY + 1):
                    FiY += 1
                    y = thumbY * thumbInterval
                    FiX = -1
                    for thumbX in xrange(rDataIndex, fiX + 1):
                        FiX += 1
                        x = thumbX * thumbInterval + 1

                        # 上下左右
                        if y - 1 >= 0:
                            c = noList[y - 1][x]
                            if c in doorNotation:
                                if c != doorNotation[0]:
                                    substitutes[0] = doorNotation.index(c)
                                    doorUp = []

                                if substitutes[0] == 0:
                                    doorUp.append(FiX)

                        if y + 3 < h - 1:
                            c = noList[y + 3][x]
                            if c in doorNotation:
                                if c != doorNotation[1]:
                                    substitutes[1] = doorNotation.index(c)
                                    doorDown = []

                                if substitutes[1] == 1:
                                    doorDown.append(FiX)

                        if x - 1 >= 1:
                            c = noList[y][x - 1]
                            if c in doorNotation:
                                if c != doorNotation[2]:
                                    substitutes[2] = doorNotation.index(c)
                                    doorLeft = []

                                if substitutes[2] == 2:
                                    doorLeft.append(FiY)

                        if x + 3 < w - 2:
                            c = noList[y][x + 3]
                            if c in doorNotation:
                                if c != doorNotation[3]:
                                    substitutes[3] = doorNotation.index(c)
                                    doorRight = []

                                if substitutes[3] == 3:
                                    doorRight.append(FiY)

                door = []
                door.append(doorUp)
                door.append(doorDown)
                door.append(doorLeft)
                door.append(doorRight)

                oneFi["door"] = door
                oneFi["substitutes"] = substitutes

                fi.append(oneFi)
        return fi

    def getIndex(self, x, y):
        return x * 1000 + y

    # 获取对应场景的attri scene0是home
    def readAttriJson(self, sceneIndex):

        if not self.attriJson:
            with open("./map/mapAttri.json", 'r') as load_f:
                self.attriJson = json.load(load_f)

        if sceneIndex >= len(self.attriJson):
            return {}
        else:
            return self.attriJson[sceneIndex]

    def saveJsonAndImg(self, path, oldPath):
        index = 0
        for jsonData in self.jsonDataList:
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


if '__main__' == __name__:
    creator = MapCreator()
    creator.createMap()
