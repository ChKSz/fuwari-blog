import keyboard
import pyperclip
from PIL import ImageGrab, Image
import io
import boto3
from botocore.config import Config
import time
import uuid
import pyautogui
import os
from io import BytesIO
# 示例配置
# # R2 配置
# R2_CONFIG = {
#     'account_id': '11111111111111111',
#     'access_key_id': '11111111111111111',
#     'secret_access_key': '11111111111111111',
#     'bucket_name': '11111111111111111'
# }

# # OSS 配置
# OSS_CONFIG = {
#     'url': 'oss.onani.cn',
#     'prefix': '/fuwari-blog/img'
# }
#########################################################
# R2 配置
R2_CONFIG = {
    'account_id': '',
    'access_key_id': '',
    'secret_access_key': '',
    'bucket_name': ''
}

# OSS 配置
OSS_CONFIG = {
    'url': '',
    'prefix': ''
}
#########################################################
def init_r2_client():
    """初始化 R2 客户端"""
    return boto3.client(
        's3',
        endpoint_url=f'https://{R2_CONFIG["account_id"]}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_CONFIG['access_key_id'],
        aws_secret_access_key=R2_CONFIG['secret_access_key'],
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def get_image_from_clipboard():
    """从剪贴板获取图片"""
    try:
        image = ImageGrab.grabclipboard()
        if image is None:
            return None
            
        # 如果是列表（多个文件），取第一个
        if isinstance(image, list):
            if len(image) > 0:
                # 如果是图片文件路径，打开它
                try:
                    return Image.open(image[0])
                except Exception as e:
                    print(f"打开图片文件失败: {e}")
                    return None
            return None
            
        # 如果直接是 Image 对象
        if isinstance(image, Image.Image):
            return image
            
        return None
    except Exception as e:
        print(f"获取剪贴板图片失败: {e}")
        return None

def convert_to_webp(image):
    """将图片转换为 webp 格式"""
    if not image:
        return None
    
    try:
        buffer = BytesIO()
        # 确保图片是 RGB 模式
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
            
        image.save(buffer, format="WEBP", quality=80)
        return buffer.getvalue()
    except Exception as e:
        print(f"转换图片失败: {e}")
        return None

def upload_to_r2(image_data):
    """上传图片到 R2"""
    if not image_data:
        return None

    client = init_r2_client()
    
    # 生成基础文件名
    base_filename = f"{uuid.uuid4()}.webp"
    filename = base_filename
    
    try:
        # 检查文件是否已存在
        attempt = 1
        while True:
            try:
                # 尝试获取文件信息，如果文件存在会返回数据，不存在会抛出异常
                client.head_object(
                    Bucket=R2_CONFIG['bucket_name'],
                    Key=f"{OSS_CONFIG['prefix'].strip('/')}/{filename}"
                )
                # 如果文件存在，修改文件名
                name_without_ext = base_filename.rsplit('.', 1)[0]
                filename = f"{name_without_ext}_{attempt}.webp"
                attempt += 1
                print(f"文件名已存在，尝试重命名为: {filename}")
            except client.exceptions.ClientError as e:
                # 如果是 404 错误，说明文件不存在，可以使用这个文件名
                if e.response['Error']['Code'] == '404':
                    break
                raise e  # 其他错误则抛出
                
        # 上传文件
        client.put_object(
            Bucket=R2_CONFIG['bucket_name'],
            Key=f"{OSS_CONFIG['prefix'].strip('/')}/{filename}",
            Body=image_data,
            ContentType='image/webp'
        )
        return filename
    except Exception as e:
        print(f"上传失败: {e}")
        return None

def generate_markdown_link(filename):
    """生成 Markdown 图片链接"""
    if not filename:
        return None
    
    url = f"https://{OSS_CONFIG['url']}{OSS_CONFIG['prefix']}/{filename}"
    return f"![]({url})"

def type_markdown_link(markdown_link):
    """模拟键盘输入 Markdown 链接"""
    if not markdown_link:
        return
    
    pyperclip.copy(markdown_link)
    pyautogui.hotkey('ctrl', 'v')

def handle_upload():
    """处理图片上传的主函数"""
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] 收到粘贴请求")
    
    print("正在检查剪贴板...")
    # 获取剪贴板图片
    image = get_image_from_clipboard()
    if not image:
        print("❌ 剪贴板中没有图片")
        return
    print("✅ 获取到剪贴板图片")

    # 转换为 webp
    print("正在转换为 WebP 格式...")
    image_data = convert_to_webp(image)
    if not image_data:
        print("❌ 图片转换失败")
        return
    print(f"✅ 转换完成，大小: {len(image_data)/1024:.2f}KB")

    # 上传到 R2
    print("正在上传到 R2...")
    filename = upload_to_r2(image_data)
    if not filename:
        print("❌ 上传失败")
        return
    print(f"✅ 上传成功，文件名: {filename}")

    # 生成并输入 Markdown 链接
    markdown_link = generate_markdown_link(filename)
    if markdown_link:
        print(f"生成的 URL: https://{OSS_CONFIG['url']}{OSS_CONFIG['prefix']}/{filename}")
        print(f"模拟键入: {markdown_link}")
        type_markdown_link(markdown_link)
        print("✅ 操作完成")

def main():
    """主函数"""
    print("=" * 50)
    print("R2 图片上传插件已启动")
    print(f"当前配置:")
    print(f"- OSS 域名: {OSS_CONFIG['url']}")
    print(f"- 存储路径: {OSS_CONFIG['prefix']}")
    print(f"- R2 存储桶: {R2_CONFIG['bucket_name']}")
    print("使用 Ctrl+Alt+V 上传剪贴板中的图片")
    print("=" * 50)
    
    # 注册快捷键
    keyboard.add_hotkey('ctrl+alt+v', handle_upload)
    
    # 保持程序运行
    keyboard.wait()

if __name__ == "__main__":
    main() 