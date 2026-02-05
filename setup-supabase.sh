#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Roofing Compare - Supabase 设置向导${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 检测到未安装依赖，正在安装...${NC}"
    npm install
fi

# 检查 .env.local 是否存在
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 未找到 .env.local 文件${NC}"
    echo -e "${YELLOW}正在从模板创建...${NC}\n"
    
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ 已创建 .env.local 文件${NC}\n"
    else
        echo -e "${RED}错误: 未找到 .env.local.example 模板文件${NC}"
        exit 1
    fi
fi

# 检查 Supabase 配置
source .env.local 2>/dev/null

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" == "your_supabase_project_url" ]; then
    echo -e "${RED}❌ Supabase 配置未完成${NC}\n"
    echo -e "请按照以下步骤配置：\n"
    echo -e "1. 访问 ${BLUE}https://supabase.com${NC} 创建项目"
    echo -e "2. 获取项目的 URL 和 API 密钥"
    echo -e "3. 编辑 ${YELLOW}.env.local${NC} 文件，填入真实凭据\n"
    echo -e "详细教程请查看: ${BLUE}SUPABASE_SETUP.md${NC}\n"
    
    read -p "按回车键打开设置文档，或按 Ctrl+C 退出... " dummy
    
    if command -v open &> /dev/null; then
        open SUPABASE_SETUP.md
    elif command -v xdg-open &> /dev/null; then
        xdg-open SUPABASE_SETUP.md
    else
        cat SUPABASE_SETUP.md
    fi
    
    exit 1
fi

echo -e "${GREEN}✅ Supabase 配置已完成${NC}"
echo -e "   URL: ${BLUE}${NEXT_PUBLIC_SUPABASE_URL}${NC}\n"

# 菜单选项
echo -e "${YELLOW}请选择操作：${NC}\n"
echo -e "  ${BLUE}1)${NC} 创建数据库表结构 (首次使用)"
echo -e "  ${BLUE}2)${NC} 运行数据挖掘脚本 (获取全美数据)"
echo -e "  ${BLUE}3)${NC} 切换到 Supabase 版本前端"
echo -e "  ${BLUE}4)${NC} 启动开发服务器"
echo -e "  ${BLUE}5)${NC} 完整设置 (1+2+3+4)"
echo -e "  ${BLUE}0)${NC} 退出\n"

read -p "请输入选项 (0-5): " choice

case $choice in
    1)
        echo -e "\n${BLUE}📊 创建数据库表结构...${NC}\n"
        echo -e "${YELLOW}请执行以下步骤：${NC}"
        echo -e "1. 访问 ${BLUE}${NEXT_PUBLIC_SUPABASE_URL}/project/default/sql${NC}"
        echo -e "2. 点击 '+ New query'"
        echo -e "3. 复制 ${YELLOW}supabase-schema.sql${NC} 的内容"
        echo -e "4. 粘贴并点击 'Run'\n"
        
        if command -v pbcopy &> /dev/null; then
            cat supabase-schema.sql | pbcopy
            echo -e "${GREEN}✅ SQL 内容已复制到剪贴板！${NC}\n"
        fi
        
        read -p "按回车键在浏览器中打开 Supabase SQL 编辑器... " dummy
        
        if command -v open &> /dev/null; then
            open "${NEXT_PUBLIC_SUPABASE_URL}/project/default/sql"
        fi
        ;;
        
    2)
        echo -e "\n${BLUE}🔍 运行数据挖掘脚本...${NC}\n"
        node scripts/fetch-permits-supabase.js
        
        if [ $? -eq 0 ]; then
            echo -e "\n${GREEN}✅ 数据挖掘完成！${NC}"
        else
            echo -e "\n${RED}❌ 数据挖掘失败，请检查错误信息${NC}"
        fi
        ;;
        
    3)
        echo -e "\n${BLUE}🔄 切换到 Supabase 版本前端...${NC}\n"
        
        if [ -f "app/page.tsx" ]; then
            mv app/page.tsx app/page-local.tsx.bak
            echo -e "${YELLOW}已备份原文件为 app/page-local.tsx.bak${NC}"
        fi
        
        if [ -f "app/page-supabase.tsx" ]; then
            cp app/page-supabase.tsx app/page.tsx
            echo -e "${GREEN}✅ 已切换到 Supabase 版本${NC}\n"
        else
            echo -e "${RED}❌ 未找到 app/page-supabase.tsx${NC}"
        fi
        ;;
        
    4)
        echo -e "\n${BLUE}🚀 启动开发服务器...${NC}\n"
        npm run dev
        ;;
        
    5)
        echo -e "\n${BLUE}🎯 执行完整设置流程...${NC}\n"
        
        echo -e "${YELLOW}步骤 1/4: 准备数据库表结构${NC}"
        echo -e "请先在 Supabase 中创建表结构（参考选项1）\n"
        read -p "表结构创建完成后，按回车继续... " dummy
        
        echo -e "\n${YELLOW}步骤 2/4: 挖掘数据${NC}"
        node scripts/fetch-permits-supabase.js
        
        echo -e "\n${YELLOW}步骤 3/4: 切换前端版本${NC}"
        if [ -f "app/page.tsx" ]; then
            mv app/page.tsx app/page-local.tsx.bak
        fi
        if [ -f "app/page-supabase.tsx" ]; then
            cp app/page-supabase.tsx app/page.tsx
        fi
        
        echo -e "\n${YELLOW}步骤 4/4: 启动服务器${NC}"
        npm run dev
        ;;
        
    0)
        echo -e "${BLUE}👋 再见！${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}无效的选项${NC}"
        exit 1
        ;;
esac
