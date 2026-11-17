# frozen_string_literal: true

# Adds width and height to post images that have none, read from the image
# file. With both set, the browser reserves the space before the image loads,
# so the text below it does not jump (Cumulative Layout Shift).
#
# Runs after Markdown conversion and before the layout, so the theme's own
# image handling (_includes/refactor-content.html) sees the sizes.
module ImageDimensions
  IMG_TAG = /<img\b[^>]*>/i
  SRC = /\bsrc\s*=\s*["'](\/[^"'?#]+)["']/i
  SIZED = /\s(?:width|height)\s*=/i

  module_function

  def add_sizes(html, site)
    html.gsub(IMG_TAG) do |tag|
      next tag if tag.match?(SIZED)

      src = tag[SRC, 1]
      size = src && size_of(File.join(site.source, src))
      next tag unless size

      tag.sub(/<img\b/i, %(<img width="#{size[0]}" height="#{size[1]}"))
    end
  end

  def size_of(path)
    return nil unless File.file?(path)

    case File.extname(path).downcase
    when '.png' then png_size(path)
    when '.gif' then gif_size(path)
    when '.svg' then svg_size(path)
    end
  end

  # PNG: width and height are big-endian 32-bit integers at bytes 16 to 23.
  def png_size(path)
    header = File.binread(path, 24)
    return nil unless header && header.bytesize == 24 && header[1, 3] == 'PNG'

    header[16, 8].unpack('NN')
  end

  # GIF: width and height are little-endian 16-bit integers at bytes 6 to 9.
  def gif_size(path)
    header = File.binread(path, 10)
    return nil unless header && header.bytesize == 10 && header.start_with?('GIF')

    header[6, 4].unpack('vv')
  end

  # SVG: plain-number width and height on the root tag, or else the viewBox.
  def svg_size(path)
    root = File.read(path, 4096, encoding: 'UTF-8')[/<svg\b[^>]*>/im]
    return nil unless root

    width = root[/\swidth\s*=\s*["']([\d.]+)(?:px)?["']/i, 1]
    height = root[/\sheight\s*=\s*["']([\d.]+)(?:px)?["']/i, 1]
    return [width, height].map { |v| v.to_f.round } if width && height

    box = root[/\sviewBox\s*=\s*["']([^"']+)["']/i, 1]&.split(/[\s,]+/)
    box && box.size == 4 ? [box[2], box[3]].map { |v| v.to_f.round } : nil
  end
end

Jekyll::Hooks.register :posts, :post_convert do |post|
  post.content = ImageDimensions.add_sizes(post.content, post.site)
end
