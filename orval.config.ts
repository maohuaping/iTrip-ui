export default {
    api : { // 这个名称可以自定义
        output: {
            mode: 'tags-split', // 按 API 标签分割文件（推荐）
            target: './src/api', // 输出目录
            // schemas: 'src/model', // 指定模型文件的位置
            client: 'axios', // 使用 axios 作为 HTTP 客户端
            mock: false, // 关闭生成模拟数据
            clean: true, // 生成前清理目录
            prettier: true, // 使用 prettier 格式化代码
            override: {
                // 自定义 HTTP 客户端
                mutator: {
                    path: './src/boot/orval-client.ts',
                    name: 'customInstance',
                },
            },
            // namingConvention: 'PascalCase',  指定生成的文件名的命名规则，默认是camelCase
        },
        input: {
            // 指定 OpenAPI 规范文件的位置
            // 可以是本地文件
            // target: './openapi.yaml',
            // 或者远程 URL
            target: 'http://localhost:8080/v3/api-docs',
        },
        hooks: {
            afterAllFilesWrite: 'prettier --write', // 生成后格式化代码
        },
    },
}; 