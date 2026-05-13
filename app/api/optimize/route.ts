import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge"; // 防止超时

export async function POST(req: Request) {
  try {
    // 1. 验证登录状态 (这里之前已经加过 await 了)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🟢 关键修改：在这里先“唤醒” clerkClient
    const client = await clerkClient();

    // 2. 获取用户并检查剩余次数 (新用户默认送 3 次)
    // 🟢 注意这里把 clerkClient 改成了 client
    const user = await client.users.getUser(userId);
    const currentCredits = user.publicMetadata.credits !== undefined 
      ? (user.publicMetadata.credits as number) 
      : 3; 

    // 3. 次数用尽，拒绝服务
    if (currentCredits <= 0) {
      return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 403 });
    }

    const { content } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 4. AI 严格提示词
     const systemPrompt = `你现在不是一个对话助手，而是一个无情的、没有感情的简历格式化程序 API。
你的唯一任务是：接收用户的粗略经历，直接输出 3-4 条符合 STAR 法则的专业简历描述。

【绝对禁止】：
1. 严禁输出任何问候语（如“好的”、“没问题”）。
2. 严禁输出任何标题、分类（如“版本一”、“第一步”、“原始描述”）。
3. 严禁输出任何解释、建议或废话。
4. 严禁与用户对话。

【输出格式要求】：
- 必须且只能输出列表条目。
- 每条必须以 '• ' 开头（全角点+空格）。
- 如果用户提供的信息极少（如“抖音运营”），请根据该岗位的行业通用做法合理扩充，并使用 [具体数据] 作为占位符提醒用户补充。

【示例输入】：抖音实习，做过运营。
【示例强制输出】：
• 独立负责抖音账号的日常内容规划与运营，定期策划并发布符合平台热点的短视频，有效提升账号曝光量。
• 深入追踪并分析后台核心数据（播放量、完播率、互动率），基于数据反馈持续优化视频封面与文案策略，使视频平均点击率提升 [具体百分比]%。
• 统筹并参与社群用户互动与维护，设计引流活动机制，提升核心粉丝粘性，累计为私域社群沉淀 [具体数量] 名高质量活跃用户。

记住：除了像示例中那样的纯简历文本，不准输出任何额外字符！`;

    // 5. 调用 DeepSeek
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2, 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
      }),
    });

    const data = await response.json();
    const optimizedText = data.choices[0].message.content.trim();

    // 6. 核心：扣减 1 次使用次数
    // 🟢 注意这里也把 clerkClient 改成了 client
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: currentCredits - 1,
      },
    });

    return NextResponse.json({ result: optimizedText, remainingCredits: currentCredits - 1 });

  } catch (error) {
    console.error("接口错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}