package utils

import (
	"flag"
	"io/ioutil"
	"os"
	"regexp"
	"strings"
)
//这个工具会根据项目文件名取去修正包名称
var (
	files []string //所有的go文件
	projectName string //项目根目录名称

	projectPath=flag.String("path","","项目目录")
	searchName=flag.String("oldProjectName","go_admin","旧的项目目录名称")

	goFileRe=regexp.MustCompile(`.+\.go$`);

)

func main()  {
	flag.Parse()
	pos:=strings.LastIndex(*projectPath,"go/src/")
	projectName=string([]byte(*projectPath)[pos:])

	projectName=strings.Replace(projectName,"go/src/","",-1)


	_ = ListDir(*projectPath)

	//项目下所有的go文件
	for _,file:=range files {
		replace(file,*searchName,projectName)
	}
}

//获取指定目录下的所有文件和目录
func ListDir(dirPth string) ( err error) {
	//fmt.Println(dirPth)
	dir, err := ioutil.ReadDir(dirPth)
	if err != nil {
		return  err
	}
	PthSep := string(os.PathSeparator)

	for _, fi := range dir {

		if fi.IsDir() {
			ListDir(dirPth + PthSep + fi.Name())
		}else{
			//fmt.Println("s")
			if goFileRe.Match([]byte(fi.Name())) {
				files= append(files, dirPth+PthSep+fi.Name())
			}
		}
	}
	return  nil
}

//替换文件中的内容
func replace(path string,search string,replace string)  {
	content,err:=ioutil.ReadFile(path)
	if err != nil {
		return
	}

	str:=strings.Replace(string(content),"\""+search+"/","\""+replace+"/",-1)

	ioutil.WriteFile(path,[]byte(str),0666)

}


