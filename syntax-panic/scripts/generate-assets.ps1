Add-Type -AssemblyName System.Drawing

function Save-Png {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [string]$Path
    )
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $Bitmap.Dispose()
    Write-Host "OK $Path"
}

function New-Logo {
    $w = 480; $h = 480
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(24, 13, 46))
    $penM = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 46, 147), 12)
    $penC = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 240, 255), 6)
    $penA = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 179, 71), 6)
    $g.DrawRectangle($penM, 40, 40, $w - 80, $h - 80)
    $g.DrawRectangle($penC, 60, 60, $w - 120, $h - 120)
    $g.DrawLine($penC, 240, 40, 240, $h - 40)
    $g.DrawLine($penC, 40, 240, $w - 40, 240)
    $g.DrawLine($penA, 240, 190, 240, 300)
    $font = New-Object System.Drawing.Font("Arial", 34, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 240, 255))
    $str = "SYNTAX PANIC"
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($str, $font, $brush, (New-Object System.Drawing.RectangleF(0, 200, $w, 80)), $fmt)
    $font2 = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("LOGO PLACEHOLDER 480x480", $font2, $brush, (New-Object System.Drawing.RectangleF(0, 300, $w, 30)), $fmt)
    $penC.Dispose(); $penM.Dispose(); $penA.Dispose()
    $brush.Dispose(); $font.Dispose(); $font2.Dispose(); $fmt.Dispose(); $g.Dispose()
    Save-Png -Bitmap $bmp -Path "public\images\syntax_panic_logo.png"
}

function New-Avatar {
    param([int]$W, [int]$H, [string]$Label, [string]$Tag, [System.Drawing.Color]$Accent, [string]$Path)
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(36, 20, 66))
    $pen = New-Object System.Drawing.Pen($Accent, 6)
    $g.DrawRectangle($pen, 6, 6, $W - 12, $H - 12)
    $brush = New-Object System.Drawing.SolidBrush($Accent)
    $g.FillRectangle($brush, 16, 16, $W - 32, $H - 32)
    $inner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 20, 66))
    $g.FillRectangle($inner, 26, 26, $W - 52, $H - 52)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 240, 255))
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $font = New-Object System.Drawing.Font("Arial", 64, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($Label, $font, $white, (New-Object System.Drawing.RectangleF(0, 0, $W, $H)), $fmt)
    $font2 = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($Tag, $font2, $white, (New-Object System.Drawing.RectangleF(0, ($H - 34), $W, 24)), $fmt)
    $font3 = New-Object System.Drawing.Font("Arial", 9, [System.Drawing.FontStyle]::Regular)
    $g.DrawString("IMG PLACEHOLDER ${W}x${H}", $font3, $white, (New-Object System.Drawing.RectangleF(0, 4, $W, 16)), $fmt)
    $pen.Dispose(); $brush.Dispose(); $inner.Dispose(); $white.Dispose()
    $font.Dispose(); $font2.Dispose(); $font3.Dispose(); $fmt.Dispose(); $g.Dispose()
    Save-Png -Bitmap $bmp -Path $Path
}

function New-Background {
    $w = 960; $h = 360
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $g.Clear([System.Drawing.Color]::FromArgb(24, 13, 46))
    $rec = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $c1 = [System.Drawing.Color]::FromArgb(13, 7, 32)
    $c2 = [System.Drawing.Color]::FromArgb(36, 20, 66)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rec, $c1, $c2, 90)
    $g.FillRectangle($brush, $rec)
    $moon = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 179, 71))
    $g.FillEllipse($moon, 760, 40, 90, 90)
    $moonD = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 13, 46))
    $g.FillEllipse($moonD, 790, 40, 90, 90)
    $rnd = New-Object System.Random(7)
    $star = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    for ($i = 0; $i -lt 90; $i++) {
        $g.FillRectangle($star, $rnd.Next(0, $w), $rnd.Next(0, 220), 2, 2)
    }
    $building = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 11, 40))
    $building2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 17, 51))
    $win = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 46, 147))
    $winC = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    $x = 0
    while ($x -lt $w) {
        $bw = 30 + $rnd.Next(0, 70)
        $bh = 40 + $rnd.Next(0, 120)
        $sel = if ($rnd.Next(0, 2) -eq 0) { $building } else { $building2 }
        $g.FillRectangle($sel, $x, (220 - $bh), $bw, ($bh + 60))
        $wx = $x + 4
        while ($wx -lt $x + $bw - 4) {
            $wy = 224 - $bh + 4
            while ($wy -lt 252) {
                if ($rnd.Next(0, 3) -eq 0) {
                    $col = if ($rnd.Next(0, 2) -eq 0) { $winC } else { $win }
                    $g.FillRectangle($col, $wx, $wy, 3, 4)
                }
                $wy += 9
            }
            $wx += 8
        }
        $x += $bw + 3
    }
    $street = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 9, 38))
    $g.FillRectangle($street, 0, 296, $w, 64)
    $edge = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    $g.FillRectangle($edge, 0, 296, $w, 3)
    $dash = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 179, 71))
    for ($dx = 0; $dx -lt $w; $dx += 40) {
        $g.FillRectangle($dash, $dx, 330, 22, 3)
    }
    $br = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 240, 255))
    $g.FillRectangle($br, ($w - 210), 100, 190, 96)
    $br2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 13, 46))
    $g.FillRectangle($br2, ($w - 200), 110, 170, 76)
    $txt = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 46, 147))
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("CAMPUS NIGHT RUN", $font, $txt, (New-Object System.Drawing.RectangleF(($w - 210), 118, 190, 30)), $fmt)
    $font2 = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Regular)
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 240, 255))
    $g.DrawString("BG PLACEHOLDER 960x360", $font2, $white, (New-Object System.Drawing.RectangleF(($w - 210), 156, 190, 20)), $fmt)
    $brush.Dispose(); $moon.Dispose(); $moonD.Dispose(); $star.Dispose()
    $building.Dispose(); $building2.Dispose(); $win.Dispose(); $winC.Dispose()
    $street.Dispose(); $edge.Dispose(); $dash.Dispose(); $br.Dispose(); $br2.Dispose()
    $txt.Dispose(); $white.Dispose(); $fmt.Dispose(); $font.Dispose(); $font2.Dispose(); $g.Dispose()
    Save-Png -Bitmap $bmp -Path "public\images\levels\campus_bg.png"
}

New-Logo
New-Avatar -W 200 -H 240 -Label "SW" -Tag "PLACEHOLDER AVATAR" -Accent ([System.Drawing.Color]::FromArgb(255, 46, 147)) -Path "public\images\avatars\sangwoo.png"
New-Avatar -W 200 -H 240 -Label "JY" -Tag "PLACEHOLDER AVATAR" -Accent ([System.Drawing.Color]::FromArgb(0, 240, 255)) -Path "public\images\avatars\jaeyoung.png"
New-Background