/**
 * models.dev API 类型定义
 *
 * 基于 https://models.dev/api.json 的数据结构
 * 提供 AI 模型规格、定价和能力信息
 */

/** 模型输入/输出模态 */
export interface ModelModalities {
  input: ModelModality[];
  output: ModelModality[];
}

/** 支持的模态类型 */
export type ModelModality = "text" | "image" | "audio" | "video" | "embedding";

/** 模型费用 (单位: USD per million tokens) */
export interface ModelCost {
  /** 输入 token 费用 */
  input: number;
  /** 输出 token 费用 */
  output: number;
  /** 缓存读取费用 */
  cache_read?: number;
  /** 缓存写入费用 */
  cache_write?: number;
}

/** 模型上下文限制 */
export interface ModelLimit {
  /** 上下文窗口大小 (tokens) */
  context: number;
  /** 最大输出长度 (tokens) */
  output: number;
}

/** 单个 AI 模型定义 */
export interface ModelsDevModel {
  /** 模型唯一标识 */
  id: string;
  /** 模型显示名称 */
  name: string;
  /** 模型族 (e.g. "gpt-4o", "claude-sonnet") */
  family?: string;
  /** 是否支持附件/文件上传 */
  attachment?: boolean;
  /** 是否支持推理/思考 */
  reasoning?: boolean;
  /** 是否支持工具调用 */
  tool_call?: boolean;
  /** 是否支持结构化输出 */
  structured_output?: boolean;
  /** 是否支持温度调节 */
  temperature?: boolean;
  /** 知识截止日期 */
  knowledge?: string;
  /** 发布日期 */
  release_date?: string;
  /** 最后更新日期 */
  last_updated?: string;
  /** 输入/输出模态 */
  modalities?: ModelModalities;
  /** 是否开源权重 */
  open_weights?: boolean;
  /** 费用信息 */
  cost?: ModelCost;
  /** 上下文限制 */
  limit?: ModelLimit;
}

/** AI 服务提供商定义 */
export interface ModelsDevProvider {
  /** 提供商唯一标识 (e.g. "openai", "anthropic") */
  id: string;
  /** 提供商显示名称 */
  name: string;
  /** 环境变量配置 (e.g. ["OPENAI_API_KEY"]) */
  env?: string[];
  /** npm 包名 */
  npm?: string;
  /** API 地址 */
  api?: string;
  /** 文档地址 */
  doc?: string;
  /** 模型列表 (key 为模型 id) */
  models: Record<string, ModelsDevModel>;
}

/** API 响应格式: 以 provider id 为 key 的字典 */
export type ModelsDevApiResponse = Record<string, ModelsDevProvider>;

/**
 * 面板类型枚举
 * 用于将 provider/model 按 modality 分类到不同面板
 */
export type PanelCategory = "llm" | "image" | "video" | "tts";

/** 过滤后的 Provider 视图 (包含筛选后的模型子集) */
export interface FilteredProvider {
  provider: ModelsDevProvider;
  /** 按 modality 过滤后的模型列表 */
  filteredModels: ModelsDevModel[];
}
