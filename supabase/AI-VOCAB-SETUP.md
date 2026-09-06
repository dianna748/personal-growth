# Bloom Vocab AI 部署说明

`enrich-vocab` Edge Function 在 Supabase 服务端调用 DeepSeek，网页和 GitHub 仓库都不会保存 DeepSeek API Key。

## Supabase Secrets

在 Project Settings → Edge Functions → Secrets 中添加：

- `DEEPSEEK_API_KEY`：DeepSeek 控制台生成的 API Key。
- `BLOOM_AI_ACCESS_CODE`：填写与 Bloom 网页“同步码”完全相同的值。

第二项是额外的额度保护。公开网页只会从当前浏览器的同步设置中读取同步码并通过 HTTPS 发给自己的 Edge Function；同步码不会写进仓库。函数会先校验它，再允许调用 DeepSeek。

## 部署

部署 `supabase/functions/enrich-vocab/index.ts`，函数名称必须是 `enrich-vocab`。保留 Supabase 默认的 JWT 校验；网页会同时发送项目 anon key 和上面的访问码。

部署后，Reading 选词会优先使用 DeepSeek V4 Flash 生成句中英英释义、句中英中释义、音标、词性和词根词缀／词源。DeepSeek、网络或配置暂时不可用时，网页自动改用免费词典，不影响手动填写和保存。

不要把 Secret 值写入本文件、任何 `.env`、网页 JavaScript 或 GitHub 提交。
