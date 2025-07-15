import os
import re
import win32com.client

def read_doc_file(doc_path):
    """
    使用win32com.client读取.doc文件内容
    """
    try:
        word = win32com.client.Dispatch("Word.Application")
        # 不设置Visible属性，避免某些文件的兼容性问题

        # 转换为绝对路径
        abs_path = os.path.abspath(doc_path)
        doc = word.Documents.Open(abs_path)
        text = doc.Content.Text
        doc.Close()
        word.Quit()
        return text
    except Exception as e:
        print(f"使用win32com读取文件失败: {e}")
        return None

def parse_script(doc_path, output_dir):
    """
    解析单个.doc剧本文件，按幕次拆分并保存为.txt文件。
    """
    try:
        # 提取角色名作为文件名的一部分
        base_name = os.path.basename(doc_path)
        character_name = os.path.splitext(base_name)[0]  # 修复：取元组的第一个元素

        print(f"--- 开始处理角色: {character_name} ---")

        # 读取文档内容
        full_text = read_doc_file(doc_path)
        if full_text is None:
            print(f"无法读取文件: {doc_path}")
            return

        # 使用正则表达式更精确地分割幕次
        # 我们寻找“第一幕”或“第二幕”这样的标题
        acts = re.split(r'(第一幕|第二幕)', full_text, flags=re.IGNORECASE)

        # re.split会保留分割符，所以我们需要将标题和内容配对
        # acts 列表会是这样的：['', '第一幕', '内容...', '第二幕', '内容...']

        for i in range(1, len(acts), 2):
            if i + 1 >= len(acts):
                break

            act_title = acts[i].strip()
            act_content = acts[i+1].strip()

            # 确定幕次编号
            act_number = 0
            if "第一幕" in act_title:
                act_number = 1
            elif "第二幕" in act_title:
                act_number = 2
            else:
                continue

            if not act_content:
                print(f"警告: {character_name} 的第 {act_number} 幕内容为空，跳过。")
                continue

            # 创建输出文件名 - 使用要求的格式：角色名_act_数字.txt
            output_filename = f"{character_name}_act_{act_number}.txt"
            output_path = os.path.join(output_dir, output_filename)

            # 将内容写入文件
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(act_content)

            print(f"  -> 已成功生成文件: {output_filename}")

    except Exception as e:
        print(f"处理文件 {doc_path} 时发生错误: {e}")

def main():
    """
    主函数，遍历输入目录并处理所有.doc文件。
    """
    input_directory = 'input_docs'
    output_directory = 'output_txt'

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
        print(f"创建输出目录: {output_directory}")

    print("开始批量处理剧本文件...")

    for filename in os.listdir(input_directory):
        if filename.endswith('.doc') or filename.endswith('.docx'):
            doc_path = os.path.join(input_directory, filename)
            parse_script(doc_path, output_directory)

    print("\n所有文件处理完毕！")
    print(f"请检查 '{output_directory}' 文件夹中的输出结果。")

if __name__ == "__main__":
    main()