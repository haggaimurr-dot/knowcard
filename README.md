# knowcard

多模态知识点卡。一张卡的正面是标题和释义，背面按类别收外链：图片、视频、博客、文档、音频、附件。正反面在同一页做 CSS 3D 翻转。

界面默认中文（`zh-Hans`），另有英文壳（`en`）。卡片内容存在 `data/cards.json`，不接数据库，也不做登录。

## 运行

```bash
pnpm install
pnpm dev
```

不需要环境变量。`pnpm lint` 和 `pnpm build` 在空 env 下即可通过。

- 首页 `/zh-Hans`：一句话，进入示例卡
- 列表 `/zh-Hans/cards`
- 工作室 `/zh-Hans/cards/[id]`

英文把路径里的 `zh-Hans` 换成 `en`。访问 `/` 会按语言协商跳到对应前缀，默认 `zh-Hans`。

## 工作室

- 空格或 `F` 翻转。正面按钮、背面「操作」菜单里的「翻回正面」做同一件事。
- 背面右侧是类别栏；窄屏改成横向 chips。
- 点资源会在新标签页打开 https 外链。
- 「操作」可以添加外链、改正面标题和释义。每条资源还可以编辑或删除。
- 外链只接受 `https`。这里不上传文件。

## 数据

`data/cards.json` 是读写的那一份。Server Actions：

- `listCards`
- `getCard`
- `createCard`
- `updateCardFront`
- `addResource`
- `updateResource`
- `deleteResource`

种子卡「光合作用」六类资源各有一条可打开的 https 样例。

## 这一轮不做

文件上传、Neon、Clerk、版本历史、目录、AI、生产部署。
