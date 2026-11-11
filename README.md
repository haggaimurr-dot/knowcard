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
- 卡片库 `/zh-Hans/cards`：分类和组
- 组 `/zh-Hans/groups/[groupId]`
- 全部卡片 `/zh-Hans/cards/all`
- 工作室 `/zh-Hans/cards/[id]`

英文把路径里的 `zh-Hans` 换成 `en`。访问 `/` 会按语言协商跳到对应前缀，默认 `zh-Hans`。

## 工作室

- 空格或 `F` 翻转。正面按钮、背面「操作」菜单里的「翻回正面」做同一件事。
- 背面右侧是类别栏；窄屏改成横向 chips。
- 点资源会在新标签页打开 https 外链。
- 「操作」可以添加外链、改正面标题和释义。每条资源还可以编辑或删除。
- 外链只接受 `https`。这里不上传文件。

## 数据

`data/cards.json` 是 StoreV2：`{ version: 2, categories, groups, cards }`。读到旧的卡片数组时，启动时会迁成 v2。一张卡只属于一个组，组不嵌套。Server Actions：

- `listCards` / `getCard` / `createCard` / `updateCardFront` / `deleteCard` / `copyCard` / `moveCard`
- `listCategories` / `getCategory` / `createCategory` / `updateCategory` / `deleteCategory`
- `listGroups` / `getGroup` / `createGroup` / `updateGroup` / `deleteGroup`
- `listCardsByGroup`
- `addResource` / `updateResource` / `deleteResource`

种子卡「光合作用」在「生物学 / 植物生理」，六类资源各有一条可打开的 https 样例。「化学 / 无机入门」是空组，用来试复制和移动。卡片 id 不能是 `all`。

## 这一轮不做

文件上传、Neon、Clerk、版本历史、AI、生产部署。
