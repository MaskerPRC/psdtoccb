#!/usr/bin/python
# -*- coding: utf-8 -*-
# ----------------------------------------------------------------------------
# uitool-console: command line uitool tool manager for cocos2d
#
# Author: luowei
# Email: njutcmwl@gmail.com
# ----------------------------------------------------------------------------

import sys
import os
import shutil

BasePSDDir = 'D:\\kof\\art\\'

#目标PSD
targetFile = ''
#psd文件所在目录
rootpath = ''
#
basename = ''
#psd碎图所在目录
targetDir = ''


def generate():
	#切图
	cutPSD(targetFile)
	#拼接
	plist = os.path.join(rootpath,basename + '/' + basename + '.plist')
	png = os.path.join(rootpath,basename + '/' + basename + '.png')
	generateSheet(targetDir,plist,png)

def cutPSD(filepath):
	sysCmd = ''
	sysCmd = 'uitool %s' % filepath
	print(sysCmd)
	os.system(sysCmd)

def generateSheet(dir,plist,png):
	source = ''
	list = os.listdir(dir)
	#处理公共资源不打包
	#判断图层前缀是否与最终的资源文件名一致
	basePrefix = os.path.basename(png).split('.')[0] 
	for line in list:
		if line.split('.')[0] == basePrefix:
			source += os.path.join(dir,line)
			source += ' '
	sysCmd = ''
	#sysCmd = 'Texturepacker  --size-constraints NPOT --format cocos2d --data %s --sheet %s %s ' % (plist, png,source)
	sysCmd = 'Texturepacker  --size-constraints AnySize --format cocos2d --data %s --sheet %s %s ' % (plist, png,source)
	print(sysCmd)
	os.system(sysCmd)

def rmTrees(topPath):
	for root,dirs,files in os.walk(topPath,topdown=False):
		for name in files:
			os.remove(os.path.join(root,name))
		for name in dirs:
			os.rmdirs(os.path.join(root,name))


def copyFiles(copyDestDir):
	plist = os.path.join(rootpath,basename + '/' + basename + '.plist')
	png = os.path.join(rootpath,basename + '/' + basename + '.png')
	skin = os.path.join(rootpath,basename + '/' + basename + 'Skin.lua')
	shutil.copyfile(plist, copyDestDir + '/' + basename + '.plist')
	shutil.copyfile(png, copyDestDir  + '/' +  basename + '.png' )
	shutil.copyfile(skin, copyDestDir  + '/' +  basename + 'Skin.lua' )

def webp():
	png = os.path.join(rootpath,basename + '/' + basename + '.png')
	os.system("cwebp.bat " + png)


if __name__ == "__main__":
	print(sys.argv)
	#arg[1]:源文件
	if len(sys.argv) >1 and sys.argv[1]:
		targetFile = sys.argv[1]
	else:
		targetFile = raw_input('please input the path:')	

	if not os.path.exists(targetFile):
		targetFile = BasePSDDir + targetFile + '.psd'
		
	if not os.path.exists(targetFile):
		print(targetFile + ' not exits')
		exit(1)

	#arg[2]:需要拷贝到的目标路径
	copyDestDir = ''
	if len(sys.argv) > 2 and sys.argv[2]:
		copyDestDir = sys.argv[2]
	
	#configure
	rootpath = os.path.dirname(targetFile)
	basename = os.path.basename(targetFile)
	targetFile = os.path.join(rootpath,basename)

	basename = os.path.basename(targetFile).replace('.psd','')
	targetDir = os.path.join(rootpath,basename + '/' + basename)
	print('rootpath=' + rootpath)
	print('targetDir=' + targetDir)

	#run>>>>>>
	rmTrees(targetDir)
	generate()

	if len(sys.argv) > 3 and sys.argv[3]:
		webp()
	
	#end
	if len(copyDestDir)>0:
		#拷贝文件
		copyFiles(copyDestDir)
		os.system('start ' + copyDestDir )
	else:
		os.system('start ' + os.path.join(rootpath,basename) )
	


		
