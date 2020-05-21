# 安装Vue cli
npm install -g @vue/cli

# 查看已安装Vue cli版本
vue --version 或者 vue -V

# 卸载当前Vue cli
npm uninstall @vue/cli

# 新建项目
vue create my-project

# 项目node_modules依赖根据package.json自动安装
npm install

# 项目启动
npm run serve

# 打包
npm run build

# 安装cnpm
npm install -g cnpm --registry=https://registry.npm.taobao.org

# 安装yarn，在团队开发时，一定要用这个
npm install -g yarn

# yarn命令 
npm install === yarn 
npm run serve === yarn serve

# 参看package最新版本
npm view 项目名称 version