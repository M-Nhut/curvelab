# CurveLab — Bản 8 · Bàn dựng hình mở rộng

Cập nhật 24/09/2026: Xuất LaTeX chỉ gồm các đối tượng (không nền, lưới, trục hay bảng công thức). “Lưu ảnh” chọn PNG đầy đủ hoặc PNG đối tượng có nền trong suốt. Hệ trục của bàn dựng hình 3D có vạch số. Mặt cong có nhập điểm chính xác, đường đồng mức, giao tuyến với mặt phẳng ngang, hai đường tham số qua P, gradient, đạo hàm theo hướng, Hessian và đa thức Taylor bậc hai. Các kết luận đạo hàm là cục bộ, có kiểm tra số; lưới/mặt cắt vẫn là xấp xỉ. Thêm ví dụ sóng tròn, đồi Gauss và ellipsoid.

Mở index.html bằng trình duyệt. Giữ toàn bộ các tệp và thư mục vendor cùng nhau; ứng dụng chạy ngoại tuyến, không cần cài Python hay Node.

## Năm không gian

- Đường cong: các chức năng cũ, tham số 2D/3D, hàm số, tọa độ cực, phương trình ẩn 2D, bảng biến thiên, tiếp tuyến, độ dài và khung Frenet.
- Mặt cong 3D: X(u,v) hoặc z=f(x,y), xoay/zoom, lưới tham số, màu theo độ cao hoặc K, mặt phẳng tiếp xúc và pháp tuyến tại điểm chọn. Tính E,F,G; e,f,g; K,H,k1,k2 và tích phân diện tích tham số. Có chín ví dụ gồm cầu, yên ngựa, paraboloid, xuyến, trụ, catenoid, helicoid, mặt phẳng, nón.
- Hình học phẳng: thêm, đặt tên và sửa điểm tùy ý; dựng đoạn/đường thẳng, tam giác, đường tròn với tâm bất kỳ và bán kính hoặc điểm đi qua. Có trung điểm, trung trực, song song, vuông góc, chân đường cao, phân giác, bốn tâm tam giác, đường tròn nội/ngoại tiếp, đo góc và giao điểm đường–đường / đường–tròn / tròn–tròn. Đường cao có thể dựng bằng chân vuông góc và đoạn nối; trung tuyến dùng trung điểm và đoạn nối; đường Euler dùng tâm ngoại tiếp và trực tâm. Ký hiệu góc vuông và cạnh bằng nhau được tính theo hình hiện tại.
- Hình học không gian: nhập điểm x,y,z; dựng đoạn/đường, tam giác, mặt phẳng qua ba điểm, pháp tuyến, hình chiếu lên đường hoặc mặt phẳng, mặt cầu, tứ diện và đường tròn nội/ngoại tiếp tam giác trong không gian. Có ví dụ hình lập phương. Kéo để xoay, chọn Oxy/Oxz/Oyz để kéo điểm giữ nguyên tọa độ còn lại.
- Sổ khảo sát: tối đa năm hàm f,g,h,p,q; dòng sau gọi được f(x),g(x)… phía trước. Ví dụ h(x)=f(x)+g(x). Bật/tắt, chọn màu, thay tham số a; xem đạo hàm, tiếp tuyến, nghiệm/giao điểm gần đúng và tích phân có dấu. Nút “Mở bảng biến thiên của hàm này” chuyển hàm chọn sang không gian Đường cong.

## Công thức và lưu bài

Dùng sin(2u), u^2, sqrt(u), cbrt(u), pi, 2u. Bàn phím toán nằm ngay sau nhóm nhập công thức của mặt cong và sổ khảo sát; trong bàn dựng hình nằm sau tọa độ/bán kính. Có thể nhấn Enter để cập nhật. Tất cả không gian có bật/tắt trục tọa độ; lưới được điều khiển riêng. Không nhận mã Maple hay câu lệnh chương trình. Đường cong, mặt cong và sổ khảo sát cho chọn góc trái/phải/ẩn công thức; công thức giữ lại trong PNG. Các phân số đơn giản được ưu tiên khi phù hợp với độ chính xác số; kết quả gần đúng vẫn được ghi ≈.

Lưu bài tạo tệp JSON; dùng Mở bài trong cùng nhóm không gian để nạp lại. Phần Đường cong có định dạng bài cũ; mặt cong và sổ khảo sát dùng curvelab-studio. Hai bàn dựng hình dùng curvelab-construction, có hoàn tác/làm lại, ghi chú, lưu trạng thái hiển thị và xuất PNG. Trình duyệt ghi nhớ bản vẽ 2D và 3D riêng nếu cho phép localStorage. Đường dẫn studio.html#geometry chuyển sang construction.html. Có thể mở tệp Hình học phẳng curvelab-studio cũ: các điểm, bán kính, đường dựng và ghi chú được chuyển sang đối tượng phụ thuộc. Nếu chưa có bản vẽ mới, bài hình học cũ trong localStorage được nhập ở lần mở đầu tiên; bản lưu cũ vẫn được giữ.

## Cách dùng bàn dựng hình

1. Chọn ví dụ rồi Nạp ví dụ, hoặc bắt đầu Bản vẽ trống. Nạp ví dụ thay bản vẽ hiện tại nhưng có thể Hoàn tác.
2. Nhập nhanh `A=(1,2); B=(4,0)` (3D: `A=(1,2,3)`), hoặc chọn công cụ Điểm và bấm vị trí trên hình. Tên đã có sẽ cập nhật tọa độ. Có thể nhập công thức như `sqrt(2)`.
3. Chọn phép dựng; các bước hiện bên trái và ngay trên hình. Bấm điểm có sẵn hoặc bấm vùng trống để tạo và chọn điểm mới ngay trong công cụ Đường thẳng, Đoạn thẳng, Tam giác, Tứ diện… Không cần chuyển qua công cụ Điểm. Khi đủ bước, bấm Dựng hình hoặc bật ô “Tự động dựng khi đủ bước” cạnh nút Dựng. Tự động dựng dùng bán kính/tham số đang nhập và không tự lưu các sửa đổi của đối tượng có sẵn. Công cụ Giao điểm vẫn cần các đường/tròn có sẵn. Với đường tròn, tâm có thể là bất kỳ điểm tự do hoặc điểm dựng nào. Có thể đổi sang điểm tạo sau đường tròn bằng nút Sửa.
4. Chế độ mặc định là Chọn / di chuyển. Bấm điểm để chọn, bấm đúp để mở hộp sửa tọa độ; kéo điểm tự do để di chuyển: các điểm dựng, số đo và giao điểm cập nhật theo quan hệ. Phép quay/vị tự/tịnh tiến tạo điểm ảnh có liên kết; trong 3D quay quanh trục qua tâm song song Oz.
5. Sửa đối tượng để đổi tên, tâm, bán kính hoặc tham chiếu. Muốn xóa điểm đang được dùng, xóa các đối tượng phụ thuộc trước. Không cho phép vòng phụ thuộc.
6. Trong 3D, chọn mặt phẳng đặt/kéo điểm (song song Oxy, Oxz, Oyz). Điểm mới dùng mức tọa độ được nhập; điểm đang kéo giữ tọa độ còn lại của chính nó. Kéo nền để xoay; Shift + kéo nền để di chuyển khung nhìn.
7. Tùy chọn “Làm tròn khi đặt / kéo điểm” chỉ áp dụng cho chuột, với bước 1 / 0,5 / 0,25 / 0,1. Nhập tọa độ bằng bàn phím giữ nguyên. Công tắc ký hiệu ẩn/hiện dấu vuông, cung góc, nhãn góc và vạch cạnh bằng nhau; dòng giải thích cho biết có bao nhiêu dấu phù hợp.
8. Giao điểm có nhánh 1/2 theo thứ tự phép tính; tiếp xúc chỉ có nhánh 1. Giao với đoạn được giới hạn trong đoạn. Trùng đường/tròn không tạo một giao điểm riêng biệt. Khi kéo hình làm mất giao điểm, đối tượng đó tạm không xác định và tự trở lại khi có giao điểm.
9. Hai mũi tên cong cạnh Dựng hình tương ứng Ctrl+Z và Ctrl+Y (hoặc Ctrl+Shift+Z): khôi phục cả điểm vừa tạo, lựa chọn đang dựng, biểu mẫu và góc nhìn. Khi đang gõ trong ô văn bản, các phím này vẫn dùng lịch sử soạn thảo của ô. Quay lại lần dựng tự động trả lại các điểm đã chọn để sửa; không tự dựng lại ngay khi quay lại. Nút Làm lại trên thanh công cụ bắt đầu bản vẽ trống bằng cách xóa các đối tượng; có thể dùng mũi tên quay lại để khôi phục. Ghi chú được giữ nguyên.

## Bố cục và cuộn

Trên màn hình rộng hơn 700 px, cột công cụ bên trái và cột hình/kết quả bên phải cuộn độc lập ở cả năm chế độ. Chữ chính 17 px, tiêu đề dùng màu xanh đậm thống nhất; mục Tùy chọn hình vẽ 21 px. Công cụ nằm trước thanh Nhập điểm nhanh. Danh sách đối tượng của hai bàn hình học nằm ngay dưới hình bên phải, có vùng cuộn riêng. Màn hình nhỏ dùng một trang cuộn dọc thông thường để không bó hẹp vùng thao tác. Các phép tính của Đường cong, Mặt cong và Sổ khảo sát không thay đổi.

## Quy ước và giới hạn toán học

- Đạo hàm được tạo bằng quy tắc giải tích trên các hàm được hỗ trợ, sau đó đánh giá số. Kiểm tra chính quy tại điểm không phải chứng minh chính quy trên toàn miền.
- n=Xu×Xv/‖Xu×Xv‖, II dùng e=<Xuu,n>, f=<Xuv,n>, g=<Xvv,n>. Do đó H phụ thuộc hướng n. K không đổi khi đảo hướng n. Biểu diễn mặt cầu trong ví dụ cho pháp tuyến hướng vào trong, H=1/a khi a>0.
- Diện tích là tích phân trên miền tham số chữ nhật và có kể số lần phủ. Tích phân Gauss được đối chiếu giữa các lưới; chênh lệch không phải chặn sai số được chứng minh. Các điểm ngoài miền thực/không chính quy không có kết luận độ cong.
- Đồ thị và dò nghiệm là lấy mẫu, có thể bỏ sót nghiệm bội, nghiệm gần nhau, dao động nhanh, thành phần nhỏ hoặc gián đoạn. Tích phân số không thay thế xử lý tích phân suy rộng.
- Bản này không phải hệ CAS đầy đủ, không thực thi Maple, không tự chứng minh bài bất kỳ, chưa có mặt ẩn 3D hay tensor tổng quát.
- Hình học dùng số thực và dung sai khi phân loại suy biến/tiếp xúc; ký hiệu tính chất dùng dung sai 10⁻⁷. Ký hiệu là kết quả kiểm tra, không phải ràng buộc ép điểm. Số đo hiển thị gần đúng. Bàn dựng không thay thế toàn bộ GeoGebra hay hệ đại số ký hiệu Maple.
- 3D dùng phép chiếu trực giao, mặt phẳng chỉ được vẽ một mảnh; nét đứt là phần bị các mặt hoặc mặt cầu che khuất, cập nhật theo góc nhìn. Tứ diện, lăng trụ đáy tứ giác và khối sáu mặt có các mặt thật để tính che khuất; các đoạn rời không tự tạo mặt. Ví dụ lập phương cũ gồm tám điểm A–H và 12 cạnh được bổ sung khối sáu mặt khi nạp nếu hợp lệ. Biên thấy/khuất trên cạnh được dò với bước khoảng 3 pixel (tối đa 1.200 mẫu/đoạn). Mặt cầu dùng các đường tròn khung và đường bao. Chỉ hỗ trợ giao điểm tự động trong bàn 2D. Giới hạn 300 đối tượng/bài, 80 bước hoàn tác trong phiên; góc dùng độ ở phép quay và phép đo, radian trong sin/cos.

## Kiểm tra đã thực hiện

Phần dựng hình mới: chạy `node development/tests/construction.test.cjs`, `node development/tests/construction-view.test.cjs` và `node development/tests/construction-workflow.test.cjs` từ thư mục gốc dự án (bộ workflow cũng chạy các kiểm tra interaction). Kiểm tra tạo điểm ngay trong công cụ, dựng tự động/thủ công, lùi/tiến lựa chọn dở dang, Ctrl+Z/Y, giữ góc nhìn, sửa lựa chọn bằng danh sách, sửa tác vụ suy biến, dựng tứ diện với mức z khác nhau và cấu trúc giao diện dùng chung. Các kiểm tra interaction gồm chọn điểm trên canvas, bấm đúp sửa, nhập nhanh nguyên tử, làm tròn khi kéo, hướng dẫn công cụ, công tắc ký hiệu, nét khuất lập phương khi xoay, cạnh bị che một phần và mặt cầu. Đối chiếu tam giác 3–4–5, tâm tùy chọn và cập nhật phụ thuộc, giao/cắt/tiếp xúc/giới hạn đoạn, phân giác, vuông góc, thể tích tứ diện, hình chiếu 3D, phép biến hình, suy biến, lưu/mở và hoàn tác. Kiểm tra logic giao diện dùng DOM mô phỏng và lệnh canvas, không phải kiểm tra bố cục trực quan. Chưa kiểm tra trình duyệt thực: công cụ trình duyệt chặn URL tệp cục bộ.

Các kiểm tra của bản 8 trước lần chỉnh sửa này:

Đối chiếu K,H và diện tích của cầu/mặt phẳng, K=-4,H=0 tại gốc yên ngựa, H=0 của catenoid, độ cong mặt trụ; tam giác 3–4–5 (S=6,R=5/2,r=1); giao đường–tròn 0/1/2 nghiệm; phép biến hình; đạo hàm và giao parabol–đường thẳng; guard tích phân qua cực. Kiểm tra kéo điểm, ví dụ, công thức LaTeX, lưu/mở bài, chuyển bảng biến thiên, PNG, điện thoại và ngoại tuyến. Không có yêu cầu mạng khi vận hành cục bộ.

## Xuất mã LaTeX / TikZ

Trong hình học phẳng / không gian, chọn **Chọn / di chuyển**, rồi bấm cạnh để hiện ô **Màu cạnh đã chọn** ngay phía trên hình. Mỗi cạnh của tam giác, tứ diện, lăng trụ và khối sáu mặt có màu riêng; đường thẳng, đoạn thẳng và đường tròn cũng đổi màu được. Màu được giữ khi kéo điểm, lưu/mở bài, xuất PNG/TikZ và có thể hoàn tác bằng Ctrl+Z / Ctrl+Y. Cạnh khuất đã đặt màu riêng vẫn dùng màu đó với nét đứt.

Bấm **Xuất mã LaTeX**, ngay sau **Mở bài**, để tải tệp `.tex` độc lập. Có ở đường cong, mặt cong 3D, hình học phẳng, hình học không gian và sổ khảo sát. Biên dịch bằng **XeLaTeX** (trong Overleaf: chọn Compiler → XeLaTeX). Tệp có sẵn `standalone`, các gói và thư viện TikZ, khai báo màu, tọa độ điểm hình học và toàn bộ môi trường vẽ; không cần ảnh PNG đi kèm. Chức năng tải PNG vẫn giữ nguyên.

Cấu trúc tham khảo chính: `tailieuvehinh.pdf`, phần I.1 trang 4 và hình học không gian I.3.5 trang 30–32; tham khảo bổ sung `393171234-Vehinh.pdf`. Dùng `coordinate`, `draw`, `fill`, `node`, `scope`, `clip`. Phần font Unicode bổ sung cho nhãn tiếng Việt. Các điểm có tên nội bộ an toàn P1, P2…; tên người dùng và tọa độ gốc được ghi trong chú thích.

Mã mới gom các kiểu nét / nhãn dùng chung, gom các khối cắt khung liên tiếp và dùng lệnh ellipse cho đường tròn phẳng. `tikzpicture` nằm trong `center`; kích thước khung tái sử dụng được khai báo trong `declare function`. Để phóng to / thu nhỏ đồng đều cả hình, chữ và nét, sửa duy nhất dòng `\newcommand{\FigureWidth}{16cm}` (ví dụ đổi thành `12cm`). Các đường cong / mặt cong tổng quát vẫn giữ dữ liệu lấy mẫu để tránh thay đổi miền xác định, điểm gián đoạn hoặc thứ tự che khuất khi chuyển sang bộ tính toán của PGF.

Với cùng các mẫu kiểm tra, dung lượng mã tam giác giảm từ 47.3 KB xuống 7.7 KB, đường tròn từ 37.4 KB xuống 6.6 KB, mặt cầu từ 100.9 KB xuống 16.7 KB. Kiểm tra màu từng cạnh: `node development/tests/edge-color.test.cjs`.

Bản xuất giữ khung nhìn, màu, nhãn, ký hiệu, công thức và các phần nét thấy/khuất đang hiển thị tại thời điểm bấm nút. Bấm **Căn vừa** trước nếu muốn toàn bộ hình nằm trong khung. Hình 3D xuất thành hình chiếu 2D ở góc quay hiện tại. Đường cong và mặt cong dùng chính các điểm/lưới mà trang đang vẽ; mã là bản vẽ vector tĩnh, không phải hệ dựng hình có phụ thuộc tự cập nhật trong TeX. Muốn đổi góc nhìn hoặc phép dựng, sửa trên trang rồi xuất lại. Chữ được sắp bằng font TeX nên có thể khác nhẹ font trình duyệt.

Kiểm tra: `node development/tests/tikz-export.test.cjs` và `node development/tests/tikz-views.test.cjs`. Đã biên dịch 9 mẫu bằng XeLaTeX: nét/nhãn/cắt khung, tam giác, đường tròn, tứ diện, lập phương, mặt cầu, đường cong, mặt cong và sổ khảo sát; kiểm tra không lỗi hoặc thiếu ký tự và xem PDF mẫu. Bộ thử logic dùng DOM mô phỏng, chưa kiểm tra tải tệp qua trình duyệt thực.

## Tệp chính

- index.html, app.js: không gian đường cong.
- studio.html, studio.js, studio.css: mặt cong và sổ khảo sát, kèm mã tương thích bản cũ.
- construction.html, construction.js, construction.css: bàn dựng hình 2D/3D mới.
- workspace.css: màu tiêu đề, cuộn hai cột độc lập và bố cục chung cho cả năm chế độ.
- construction-core.js: phép dựng, phụ thuộc và giao điểm.
- construction-view.js: phép chiếu, tính thấy/khuất và mặt phẳng đặt điểm; construction-specs.js: mô tả công cụ.
- construction*.test.cjs: kiểm tra toán, che khuất và logic tương tác.
- lab-core.js: tính toán mặt cong, hình học phẳng và khảo sát nhiều hàm.
- engine.js, geometry.js, analysis.js: phân tích biểu thức, đạo hàm và đường cong.
- latex.js, math-view.js, vendor/: công thức LaTeX/MathJax.
- tikz-export.js: ghi lại lệnh vẽ thành tài liệu TikZ độc lập, giữ thứ tự và kiểu nét.

Tham khảo cách tổ chức: https://maplesoft.com/products/learn/features.aspx
Tham khảo khảo sát độ cong: https://www.maplesoft.com/applications/Preview.aspx?id=3579
MathJax 3.2.2: https://www.mathjax.org/ — giấy phép Apache-2.0 trong vendor/MathJax-LICENSE.txt.

