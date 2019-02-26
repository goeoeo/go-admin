package main

import (
	_ "go_admin/routers"
	"go_admin/utils"
	"github.com/astaxie/beego"
)

func main() {

	//启用Session
	beego.BConfig.WebConfig.Session.SessionOn = true

	//初始化日志
	utils.InitLogs()
	//初始化缓存
	utils.InitCache()
	//初始化数据库
	utils.InitDatabase()

	beego.Run()
}
