package controllers

import (
	"strings"

	"go_admin/enums"
	"go_admin/models"
	"go_admin/utils"
)

type HomeController struct {
	BaseController
}

func (c *HomeController) Index() {
	//判断是否登录
	c.checkLogin()
	c.display()
}
func (c *HomeController) Page404() {
	c.display()
}
func (c *HomeController) Error() {
	c.Data["error"] = c.GetString(":error")
	c.display("home/error.html", "shared/layout_pullbox.html")
}
func (c *HomeController) Login() {

	c.display("home/login.html", "shared/layout_base.html")
}
func (c *HomeController) DoLogin() {
	username := strings.TrimSpace(c.GetString("UserName"))
	userpwd := strings.TrimSpace(c.GetString("UserPwd"))
	if len(username) == 0 || len(userpwd) == 0 {
		c.jsonResult(enums.JRCodeFailed, "用户名和密码不正确", "")
	}
	userpwd = utils.String2md5(userpwd)
	user, err := models.BackendUserOneByUserName(username, userpwd)
	if user != nil && err == nil {
		if user.Status == enums.Disabled {
			c.jsonResult(enums.JRCodeFailed, "用户被禁用，请联系管理员", "")
		}
		//保存用户信息到session
		c.setBackendUser2Session(user.Id)
		//获取用户信息
		c.jsonResult(enums.JRCodeSucc, "登录成功", "")
	} else {
		c.jsonResult(enums.JRCodeFailed, "用户名或者密码错误", "")
	}
}
func (c *HomeController) Logout() {
	user := models.BackendUser{}
	c.SetSession("backenduser", user)
	c.pageLogin()
}
