# RUBY Analyzer (Bản Độc Lập) [Việt Hóa]

Tiện ích mở rộng bên thứ ba độc lập dành cho SillyTavern 1.16+. Dựa trên số tầng (lượt phản hồi) của hội thoại để định kỳ gọi AI thực hiện các tác vụ phân tích nhân vật và ghi kết quả vào Worldbook (Sổ thế giới) của cuộc trò chuyện.

Hoạt động hoàn toàn độc lập, tách biệt khỏi plugin máy chủ, chỉ sử dụng API mở rộng chính thức của SillyTavern (`SillyTavern.getContext()`), lệnh STscript gốc và hệ thống sự kiện nguyên bản.

Bản Việt Hóa được tối ưu hóa giao diện tiếng Việt hoàn chỉnh, hỗ trợ chuyển đổi ngôn ngữ linh hoạt (🇻🇳 Tiếng Việt / 🇨🇳 Tiếng Trung) và lưu trữ cục bộ.

- **Kho lưu trữ GitHub**: [https://github.com/abcxyzeric/RUBY-viet-hoa.git](https://github.com/abcxyzeric/RUBY-viet-hoa.git)
- **Tác giả gốc**: RUBY Project (xm212617 & Haox520)
- **Bản Việt Hóa**: abcxyzeric

---

## Tính Năng Nổi Bật

- **Lắng nghe ngầm không gián đoạn**: Dựa trên các sự kiện gốc của SillyTavern (`GENERATION_ENDED` / `CHAT_CHANGED` / `MESSAGE_RECEIVED`), tự động tính toán vị trí chu kỳ sau mỗi lượt AI phản hồi; khi đến lượt sẽ âm thầm thực hiện phân tích trong nền, không chiếm dụng giao diện phía trước và không làm đứt quãng cuộc trò chuyện.
- **Điều phối chu kỳ**: Vị trí chu kỳ = `((Tầng phản hồi AI - 1) % Độ dài chu kỳ) + 1`, tính toán tức thời bằng hàm thuần khiết; tự động tích lũy và chạy bù các tầng bị bỏ sót; hỗ trợ nhiều tác vụ cùng chung một vị trí chạy tuần tự độc lập.
- **Đọc tăng tiến**: Mỗi tác vụ duy trì riêng một "dấu trang đã đọc" (lưu trong siêu dữ liệu tin nhắn hội thoại), chỉ đọc các tầng mới phát sinh sau lần chạy trước (bao gồm cả nội dung bị ẩn), tối đa 20 tầng mỗi lần; giới hạn tối đa **200.000 ký tự** nội dung hội thoại mỗi lần gọi, nếu vượt quá sẽ bỏ qua phần văn bản hội thoại thừa phía sau (giới hạn này chỉ áp dụng cho nội dung chat, các mục tham chiếu và kết quả phân tích trích dẫn luôn được giữ nguyên vẹn 100%, tuyệt đối không bị mất do cắt ngắn).
- **Cổng kết nối tóm tắt (LittleWhiteBox / SP·Database / Nhật ký Yuzuki)**: Thẻ "Cổng tóm tắt" trên bảng người chơi cho phép kích hoạt tóm tắt cốt truyện LittleWhiteBox (Tiểu Bạch), tóm tắt dạng bảng SP·Database hoặc bảng tóm tắt ký ức Yuzuki-Memory — khi phân tích, các tầng đã được tóm tắt sẽ dùng nội dung tóm tắt thay thế văn bản gốc để truyền vào prompt, các tầng mới sau mốc tóm tắt vẫn đọc văn bản gốc như bình thường; vị trí chu kỳ, bộ đếm tầng và dấu trang tác vụ hoàn toàn không bị ảnh hưởng; tự động chuyển về chế độ văn bản gốc thuần túy nếu chưa cài đặt hoặc không có dữ liệu. LittleWhiteBox đọc tóm tắt có cấu trúc trong siêu dữ liệu tin nhắn (sự kiện / thông tin nhân vật / giai đoạn cốt truyện); SP·Database đọc các mục có thể đọc trong Worldbook (bảng tóm tắt / nhân vật quan trọng / dàn ý cốt truyện, căn cứ vào ảnh chụp nhanh bảng TavernDB trên tin nhắn để xác định ranh giới); Nhật ký Yuzuki đọc bảng tóm tắt ký ức trong siêu dữ liệu tin nhắn `yuzukiMemory` (tiêu đề tóm tắt / nhân vật cốt lõi / số tầng / nội dung tóm tắt / câu hỏi chưa giải quyết, xác định ranh giới theo chuỗi liên tục của các khoảng tầng, nếu có tầng bị đứt đoạn sẽ dừng trước lỗ hổng để tránh thay thế nhầm, dòng thời gian tóm tắt cốt truyện có thể truyền kèm vào hoặc tắt trong bảng điều khiển) — tất cả đều ở chế độ chỉ đọc, không ghép nối module, không làm thay đổi dữ liệu của tiện ích khác; hỗ trợ xuất/nhập kèm theo mẫu cấu hình.
- **Chế độ Đạo diễn (Lật sang từ trang Tác vụ trong Giao diện Tác giả)**: Nút bấm 「🎬 Chế độ Đạo diễn」 ở đầu trang cấu hình tác vụ giúp lật sang giao diện điều khiển độc lập. Khi bật chu kỳ đạo diễn, Ruby đóng vai trò đạo diễn sẽ chạy 1 lần tại vị trí chu kỳ 1 (ngay sau 1-2 lượt AI phản hồi kể từ khi bật), căn cứ theo diễn biến câu chuyện, độ ưu tiên tác vụ (số càng lớn độ ưu tiên càng cao), lịch sử kích hoạt trong 5 chu kỳ gần nhất và thống kê các tác vụ lâu chưa chạy, từ đó lập ra bảng điều phối 「Vị trí → Tác vụ」 cho chu kỳ này — bảng điều phối được phân tích cú pháp nghiêm ngặt qua 2 cấp (ưu tiên ID tác vụ, dự phòng theo tên tác vụ), nếu định dạng sai lệch hoặc thiếu sót sẽ tự động thử lại theo số lần tác giả đã thiết lập, khi hết lượt thử lại sẽ hiện cảnh báo đỏ và cho phép chạy lại thủ công; sau đó mỗi khi đến vị trí đã định, hệ thống sẽ tự động đánh thức tác vụ tương ứng (sử dụng trọn vẹn luồng phân tích và dấu trang của tác vụ, đến lượt là chạy, bỏ qua quét từ khóa), mỗi tác vụ trong mỗi chu kỳ tối đa chạy 1 lần, khoảng cách tối thiểu giữa các tác vụ có thể ràng buộc cứng (0 = do AI tự quyết). Tác giả có thể kiểm soát: độ dài chu kỳ, khoảng cách tối thiểu, số lần thử lại, chọn mục tham chiếu (dành riêng cho đạo diễn đọc), mức ưu tiên của từng tác vụ kèm giới thiệu tóm tắt tùy chọn (nếu để trống sẽ tự trích xuất khoảng 200 ký tự từ mục prompt); **hướng dẫn mật độ xếp lịch** được tích hợp sẵn vào prompt — số lượng tác vụ nên bám sát khoảng cách tối thiểu do tác giả đặt (ví dụ: chu kỳ 20 tầng với khoảng cách 2 ≈ 9 tác vụ), nếu không đặt khoảng cách thì ước tính 2~3 tầng 1 tác vụ (chu kỳ 20 tầng khoảng 7~10 tác vụ), tránh trường hợp chu kỳ dài mà xếp quá thưa thớt; **API Đạo diễn** là bản sao cấu hình của RUBY API (có thể đổi model riêng có trí thông minh cao hơn cho đạo diễn, để trống các trường sẽ tự kế thừa theo RUBY API, phương thức truyền tải như streaming hoàn toàn theo thiết lập gốc của RUBY); trong **Chế độ Quyết liệt**, đạo diễn sẽ xuất thêm "Khoảng cách đạo diễn tiếp theo" để tự quyết định thời điểm xuất hiện lần tới (không bị ràng buộc bởi chu kỳ cố định); cả hai chế độ đều tích hợp **Học tập lặp lại** — số tác vụ dự kiến/thực tế kích hoạt của chu kỳ trước và số lần người chơi chạy thủ công sẽ được đưa vào làm dữ liệu tham khảo xếp lịch; khi chọn model Gemini 3.5 trở lên (bao gồm bản Pro/Flash), hệ thống sẽ tự động chuyển tin nhắn prefill trợ lý của Jailbreak thành user (do Google đã hủy hỗ trợ prefill); kế hoạch điều phối được ghi vào mục đóng trong Worldbook chỉ để engine đọc, mỗi mục cấu hình đều có cửa sổ popup hướng dẫn (?); tắt chế độ này sẽ lập tức khôi phục điều phối vị trí tĩnh, bảo toàn dấu trang và dữ liệu không bị mất.
- **Kho mục tham chiếu / Trích dẫn đầu ra tác vụ**: Các mục trong Worldbook được đăng ký thành biến để truyền vào prompt; các tác vụ có thể trích dẫn kết quả đầu ra của nhau (bao gồm trích dẫn kết quả lần trước của chính mình để tích lũy dữ liệu qua từng chu kỳ). Tiện ích tích hợp sẵn mục tham chiếu **Thư viện ràng buộc** (tiêu chuẩn kiểm tra chống văn phong sáo rỗng AI, trích từ thẻ bài 《Huyện Thành》 14_约束库.yaml): có thể chọn trực tiếp trong danh sách tham chiếu của mọi tác vụ, tác vụ mới tạo sẽ được tích chọn mặc định; nếu Worldbook của tác giả đã có sẵn mục trùng tên "Thư viện ràng buộc" (hoặc "约束库"), mục tích hợp sẽ tự động ẩn đi, quá trình tích chọn và phân tích lúc chạy sẽ ưu tiên dùng mục của tác giả (ưu tiên Worldbook trong thời gian chạy, không cần thêm thủ công vào kho tham chiếu).
- **Chế độ Viết thẻ (Thẻ thứ ba ✍️)**: Tích hợp sẵn toàn bộ quy trình viết thẻ bài nhân vật của Ruby (từ Bước 0 Suy ngẫm thẩm mỹ → Bước 8 Prompt phân tích, kèm các bước tùy chọn như Bước 4 Hồ sơ NSFW / Bước 6.5 Bàn giao sáng tác / Bước X Tự kiểm tra). Bộ quy tắc và thiết lập nhân vật được ghim nhấn mạnh ở độ sâu 0, thứ tự 999; chỉ dẫn từng bước được truyền vào Worldbook đính kèm hội thoại theo bước hiện tại; tác giả trò chuyện tự nhiên với Ruby bằng Preset/API cá nhân, RUBY chỉ đóng vai trò lắng nghe — khi phát hiện thẻ hoàn thành dạng YAML của từng bước, hệ thống sẽ tự động lưu bản thảo vào Worldbook 《ruby写卡初稿》 (Bản thảo viết thẻ Ruby) (nội dung nhân vật sắp xếp theo thứ tự sau nhân vật chính, bối cảnh/NPC/tóm lược xếp trước nhân vật chính, prompt phân tích đưa vào mục đóng và tự động điền từ khóa tên nhân vật), đồng thời tự chuyển sang bước tiếp theo; **Bản thảo dạng nhân vật được chia theo từng mục độc lập**: Bước 3 Thẻ nhân vật / Bước 4 Hồ sơ NSFW / Bước 5 NPC (mỗi NPC hoặc nhóm NPC một mục độc lập) / Bước 8 Prompt phân tích đều được lưu thành từng mục riêng biệt theo danh tính nhân vật; nếu chạy lại nhân vật cùng tên → cập nhật mục cũ, nếu là nhân vật khác (độ tương đồng tên thấp) → lưu thành mục mới, hỗ trợ thêm nhiều nhân vật liên tục mà không lo bị ghi đè; hướng dẫn bước sẽ đồng thời bật lên thành bong bóng thông báo cạnh quả cầu nổi; tiến trình được lưu vào siêu dữ liệu hội thoại, đổi đoạn chat khác không bị lẫn lộn.
- **Quả cầu nổi + Bảng điều khiển toàn diện**: Quả cầu nổi có thể kéo thả (cắt tròn theo avatar nhân vật + huy hiệu trạng thái ở góc dưới: Tích xanh=Đang lắng nghe / Điểm xanh nhấp nháy=Đang phân tích / Dấu x đỏ=Lỗi / Điểm xám=Chờ / Cây bút tím=Phiên viết thẻ) giúp mở bảng điều khiển chỉ với 1 cú nhấp chuột; mục cài đặt tiện ích trong SillyTavern cung cấp công tắc bật/tắt quả cầu nổi và thanh trượt điều chỉnh kích thước (tối đa 60px, có thể thu nhỏ dần), ngoài ra có thể gõ lệnh `/ruby` để mở bảng.
- **Cấu hình trọng tâm theo Thẻ bài (Không có tác vụ toàn cục)**: Cấu hình tác vụ được ghi trực tiếp vào trường `data.extensions` của thẻ nhân vật thông qua API chính thức `writeExtensionField` của SillyTavern, **khi xuất hoặc chia sẻ thẻ nhân vật cấu hình sẽ đi kèm theo thẻ**, môi trường khác chỉ cần nhập thẻ là tự động có hiệu lực; sau khi mở thẻ nhân vật, việc nhập mẫu hoặc tạo mới/chỉnh sửa tác vụ sẽ **tự động liên kết vào thẻ hiện tại**; engine chỉ chạy cấu hình của thẻ nhân vật đã được liên kết, khi chưa mở thẻ hoặc chưa liên kết bảng điều khiển sẽ nhắc nhở liên kết (đã loại bỏ ràng buộc nhân vật ở cấp tác vụ — cấu hình tự động đi theo thẻ, không cần chỉ định lặp lại).
- **Bảo mật API**: Khóa API chỉ lưu trữ cục bộ trong cài đặt máy cá nhân, tuyệt đối không bao giờ bị ghi vào thẻ nhân vật / Worldbook / mẫu xuất; các yêu cầu đến endpoint tùy chỉnh đều được chuyển tiếp qua máy chủ SillyTavern (không lo CORS, không để lộ khóa API ở phía frontend).
- **Đa phương án cấu hình + Nhập xuất mẫu**: Chuyển đổi linh hoạt giữa nhiều bộ phương án cấu hình; mẫu JSON cắm là chạy, tương thích ngược với định dạng mẫu cũ.
- **Kênh cập nhật gốc**: File manifest đã kích hoạt `auto_update`, tự động hoặc thủ công cập nhật thông qua Trình quản lý tiện ích của SillyTavern.

---

## Hướng Dẫn Cài Đặt

### Cách 1: Cài đặt qua Trình quản lý tiện ích SillyTavern (Khuyên dùng)

1. Mở SillyTavern, vào biểu tượng **Tiện ích mở rộng** (hình phích cắm `🔌` hoặc dấu xếp khối trên thanh điều hướng).
2. Chọn **Cài đặt tiện ích mở rộng (Install Extension)**.
3. Dán địa chỉ kho lưu trữ sau vào ô URL và nhấn Cài đặt:
   ```
   https://github.com/abcxyzeric/RUBY-viet-hoa.git
   ```
4. Sau khi cài đặt hoàn tất, làm mới lại trang giao diện (F5).

### Cách 2: Cài đặt thủ công qua thư mục

Sao chép toàn bộ thư mục `RUBY` (hoặc đổi tên thành `ruby-analyzer`) vào đường dẫn tiện ích của SillyTavern:

```
SillyTavern/public/scripts/extensions/third-party/ruby-analyzer
```
*(hoặc thư mục người dùng: `SillyTavern/data/<tên_user>/extensions/RUBY-viet-hoa`)*

Sau đó tải lại trang SillyTavern là tiện ích sẽ tự động khởi chạy.

---

## Kênh Kết Nối API

Mọi lệnh gọi phân tích đều đi qua kênh của SillyTavern (khởi tạo từ dịch vụ frontend của SillyTavern và được backend SillyTavern chuyển tiếp ra ngoài), hoàn toàn không có kết nối trực tiếp độc lập nào từ trình duyệt ra ngoài; toàn bộ quy trình chạy bất đồng bộ, không gây nghẽn đoạn hội thoại.

| Kênh kết nối | Phương thức | Giải thích chi tiết |
|---|---|---|
| API chính của SillyTavern | Lệnh gọi gốc `generateRaw` (gọi ở chế độ im lặng - quiet) | Mượn kênh gửi chính của SillyTavern: **bỏ qua hoàn toàn việc chèn prompt của Preset** — Prompt chính, Jailbreak, Thẻ nhân vật, Lịch sử chat đều không bị đưa vào ngữ cảnh; dữ liệu gửi đi chỉ có tin nhắn Jailbreak và Prompt tác vụ do chính RUBY tự lắp ráp (cùng cơ chế với prompt im lặng của SillyTavern); tham số sinh của RUBY được ghi đè vào yêu cầu thông qua hook sự kiện chính thức `CHAT_COMPLETION_SETTINGS_READY`. Yêu cầu gửi ra ngoài có cùng nguồn gốc và định dạng như quá trình sinh bình thường |
| Endpoint tùy chỉnh tương thích OpenAI | Dịch vụ gốc `ChatCompletionService` (Dịch vụ yêu cầu chính thức từ ST 1.16+) | Dịch vụ chat completion chính thức do SillyTavern cung cấp cho các tiện ích mở rộng: cùng endpoint backend, cùng quy ước lắp ráp payload, cùng bộ phân tích SSE (`EventSourceStream` + `getStreamingReply`). Địa chỉ chỉ cần điền đến phần phiên bản (ví dụ: `https://api.deepseek.com/beta`), backend sẽ tự động nối thêm `/chat/completions`; hỗ trợ lấy danh sách model chỉ với 1 cú nhấp chuột |

### Tên Model: Nhập tự do + Chọn nhanh từ danh sách

Ô nhập tên model của cả API chính và API Đạo diễn đều **luôn hiển thị và cho phép nhập tự do** (trước hoặc sau khi lấy danh sách đều có thể gõ trực tiếp bất kỳ tên model nào, hỗ trợ đầy đủ các model tùy chỉnh của các trạm trung gian, tiền tố như `model:deepseek/chat`...). Việc bấm nút "Kết nối / Lấy danh sách model" chỉ đóng vai trò hỗ trợ chọn nhanh: khi chọn một mục sẽ tự điền vào ô văn bản và lưu lại; mục đầu danh sách 「— Chọn từ danh sách / Nhập tự do vào ô —」 sẽ không làm thay đổi giá trị tùy chỉnh bạn đã nhập. Khi lưu và vận hành, hệ thống luôn lấy giá trị thực tế trong ô nhập văn bản làm chuẩn.

---

## Danh Sách Lệnh Tắt (Slash Commands)

```
/ruby                    Mở bảng điều khiển RUBY
/ruby status             Xem trạng thái hiện tại của engine
/ruby run task=1         Thực thi thủ công tác vụ #1
/ruby run startup=true   Thực thi thủ công tác vụ mở đầu (Startup Task)
/ruby run all=true       Thực thi thủ công tất cả các tác vụ đang bật
/ruby run director=true  Thực thi thủ công tác vụ Đạo diễn
/ruby reload             Tải lại cấu hình (áp dụng sau khi đổi liên kết / đổi phương án)
/ruby preset             Liệt kê tất cả các phương án cấu hình (đánh dấu phương án đang kích hoạt)
/ruby preset <tên|id>    Chuyển đổi phương án cấu hình: ghi activePresetId vào thẻ ngay lập tức + nạp lại engine
                         (Thẻ nhân vật có thể mang nhiều bộ phương án như bản thường/bản mở rộng, gọi qua runSlash ở giao diện mở đầu)
/ruby cw                 Mở thẻ Viết thẻ (Card Writer)
/ruby cw status          Xem trạng thái phiên làm việc viết thẻ
/ruby cw action=start    Bắt đầu phiên viết thẻ (có thể thêm step=Step3 để chỉ định bước bắt đầu)
/ruby cw action=end      Kết thúc phiên viết thẻ (vẫn giữ lại bản thảo)
```

---

## Chế Độ Viết Thẻ Nhân Vật (Thẻ thứ ba ✍️)

Tích hợp toàn bộ quy trình viết thẻ bài chuyên nghiệp của Ruby vào tiện ích, **sử dụng hoàn toàn kênh gốc của SillyTavern**: tác giả dùng Preset và API của riêng mình để trò chuyện với Ruby, RUBY chỉ đóng vai trò lắng nghe và ghi nhận, không gửi tin nhắn thay bạn.

- **Bắt đầu phiên làm việc**: Tại bất kỳ đoạn chat nào, nhấn "Bắt đầu phiên viết thẻ", RUBY sẽ truyền nhân thiết lập của Ruby + quy tắc từng bước (ghim nhấn mạnh ở độ sâu 0, thứ tự 999) và chỉ dẫn của bước hiện tại vào Worldbook đính kèm hội thoại.
- **Hai chế độ: Nhanh / Đối thoại**:
  - *Chế độ Nhanh*: Tự động chuyển bước ngay khi phát hiện thẻ hoàn thành dạng YAML (mặc định).
  - *Chế độ Đối thoại*: Bật hộp thoại xác nhận trước khi chuyển bước, có thể chọn "Tôi muốn trao đổi thêm" để truyền thêm mục tạm thời "Tác giả chưa hoàn toàn hài lòng, tiếp tục thảo luận không vội kết luận" (sẽ tự động xóa khi chuyển bước tiếp theo), hỗ trợ định hướng và uốn nắn Ruby lâu dài.
- **Nhận diện hoàn thành nghiêm ngặt**: Bản tóm tắt YAML của các Bước 0-4 bắt buộc phải chứa các trường dữ liệu cần thiết (ví dụ: Bước 1 cần "Trải nghiệm cuộc đời + Xung đột nội tâm", Bước 3 cần "character + Cốt lõi nhân vật + Chuẩn mực viết văn") thì mới tính là hoàn thành; các đoạn trích bản thảo mà Ruby đưa ra để tham khảo sẽ không kích hoạt chuyển bước nhầm.
- **Tự động dọn dẹp mục thừa**: Khi vào Bước 4 sẽ tự động xóa các mục và bản thảo của Bước 1/2; khi vào Bước 8 sẽ xóa Bước 7; sau khi hoàn tất Tổng quan kết thúc sẽ chỉ giữ lại thiết lập thẩm mỹ / nhân vật / hồ sơ NSFW và bản thảo prompt phân tích, toàn bộ các mục phụ trợ khác của RUBY đều được dọn dẹp sạch sẽ.
- **Tổng quan kết thúc (🏁 Vào thủ công)**: Sau khi hoàn thành tất cả các bước, nhấn "Tổng quan", Ruby xuất YAML chứa nội dung hoàn tất, hệ thống sẽ tự động dọn dẹp lần cuối và kết thúc phiên làm việc.
- **Ghi bản thảo vào 《ruby写卡初稿》**: Nội dung nhân vật (Bước 0-4) xếp theo thứ tự sau nhân vật chính (order 100+); thiết lập NPC, tóm lược nhân vật, bàn giao sáng tác xếp trước nhân vật chính; prompt phân tích đưa vào **mục đóng** (order 200+), đồng thời tự động điền từ khóa tên nhân vật theo nhãn `<Tên_PhânTích>`; từ khóa tóm lược nhân vật điền "人物速览" (Tóm lược nhân vật) + Tên nhân vật.
- **Bong bóng hướng dẫn bước**: Khi chuyển bước, bên cạnh quả cầu nổi sẽ bật lên bong bóng giải thích chi tiết về bước đó (có thể tắt thủ công, tự đóng sau 60 giây), hoặc có thể tắt tính năng chèn này trong cài đặt.
- **Lưu trữ tiến trình**: Tiến trình các bước được lưu trong siêu dữ liệu tin nhắn hội thoại, mở lại đoạn chat cũ sẽ tự khôi phục đúng tiến độ; chuyển đổi qua lại giữa các đoạn chat khác nhau không bị ảnh hưởng.
- **Kết thúc phiên**: Bản thảo luôn được lưu giữ an toàn trong Worldbook 《ruby写卡初稿》 để bạn mở ra kiểm tra bất cứ lúc nào; nút "Kết thúc và dọn sạch" sẽ xóa bỏ toàn bộ các mục viết thẻ do RUBY tạo ra.

---

## Phân Tầng Cấu Hình (Mô hình trọng tâm theo Thẻ bài)

Cấu hình tác vụ của RUBY **chỉ tồn tại gắn liền với thẻ nhân vật**, được lưu trữ trong trường `data.extensions.RubyAnalyzer` của file JSON thẻ bài:

- Khi mở thẻ nhân vật, thao tác nhập mẫu, tạo mới hoặc chỉnh sửa tác vụ sẽ **tự động ghi vào thẻ nhân vật hiện tại** (tự động liên kết ngay lần lưu đầu tiên).
- Engine chỉ vận hành cấu hình của **thẻ nhân vật đã liên kết**; khi chưa liên kết sẽ ở trạng thái chờ và hiển thị hướng dẫn liên kết trên bảng điều khiển.
- Khi chưa mở thẻ bài nào, cấu hình tạm thời lưu tại `extensionSettings.RubyAnalyzer.global` (tầng cục bộ trên máy, không xuất theo thẻ), giao diện sẽ nhắc nhở bạn mở thẻ bài.
- Khả năng tương thích ngược: Các liên kết cục bộ kiểu cũ (`characterConfigs`) được tự động nhận diện và đọc bình thường, khi lưu thay đổi sẽ tự động di chuyển vào thẻ nhân vật.
- Khóa bảo mật API (`api`) và tùy chọn giao diện (`ui`) luôn chỉ lưu tại `settings.json` trên máy của bạn, tuyệt đối không bao giờ đi vào thẻ bài.

---

## Cấu Trúc Mã Nguồn

```
RUBY/
├── manifest.json            # Hồ sơ tiện ích mở rộng SillyTavern (hỗ trợ auto_update)
├── index.js                 # Điểm khởi chạy: khởi tạo hệ thống, đăng ký lệnh /ruby
├── style.css                # Toàn bộ CSS cho quả cầu nổi, huy hiệu và giao diện bảng điều khiển
├── README.md                # Tài liệu hướng dẫn sử dụng tiếng Việt
└── src/
    ├── i18n/                # Hệ thống đa ngôn ngữ (Tiếng Việt & Tiếng Trung)
    │   ├── index.js         # Bộ dịch DOM, bộ quan sát MutationObserver, chuyển đổi ngôn ngữ
    │   └── vi.js            # Từ điển 335+ chuỗi giao diện tiếng Việt & mẫu RegEx động
    ├── env.js               # Môi trường SillyTavern, bộ thực thi STscript, ghi log
    ├── config.js            # Lớp lưu trữ cấu hình (cục bộ / gắn thẻ), thiết lập API
    ├── scheduler.js         # Hàm tính toán chu kỳ thuần khiết, quét từ khóa, thu thập tác vụ
    ├── reader.js            # Phân loại tin nhắn, đọc tăng tiến, quản lý dấu trang
    ├── worldbook.js         # Đọc/ghi Worldbook (STscript gốc + loadWorldInfo/saveWorldInfo)
    ├── jailbreak.js         # Lắp ráp tin nhắn Jailbreak (system/assistant/user + vị trí chèn)
    ├── ai.js                # Tầng gọi AI (generateRaw / proxy máy chủ ST + SSE Streaming)
    ├── engine.js            # Điều phối sự kiện, vòng lặp chạy bù, luồng phân tích tác vụ
    ├── director.js          # Bộ máy điều phối Chế độ Đạo diễn
    ├── cardwriter.js        # Engine Chế độ Viết thẻ (chèn bước / nhận diện YAML / ghi bản thảo)
    ├── cardwriter-data.js   # Dữ liệu các bước viết thẻ (quy tắc, nhân thiết lập, chỉ dẫn)
    ├── orb.js               # Quả cầu nổi kéo thả (avatar + huy hiệu trạng thái + bong bóng bước)
    ├── orb-avatar.js        # Dữ liệu ảnh đại diện nhúng trực tiếp (Data URI base64)
    ├── settings.js          # Mục ngăn kéo cài đặt trong danh mục Extensions của SillyTavern
    └── panel.js             # Giao diện điều khiển (Người chơi / Tác giả / Viết thẻ)
```

---

## Mẫu Cấu Hình (Hot-swap & Tương Thích Ngược)

Trang nhập cấu hình tương thích với cả 3 thế hệ mẫu cấu hình:

| Nguồn mẫu | Dấu hiệu nhận diện | Hành vi khi nhập |
|---|---|---|
| Bản v3 (Hiện tại) | `_meta.version: 3.0.0`, mảng presets chứa `cyclePositions`/`keywordScan`/`characters` | Nhập bảo toàn 100% tất cả các trường dữ liệu |
| Bản cũ v2.x (Đa phương án) | `_meta.type: RUBY_ANALYZER_PRESET` + mảng `presets`, tác vụ chỉ có `triggerFloor` | Nhập độc lập từng phương án; tự động chuyển `triggerFloor` thành vị trí chu kỳ; đồng bộ chuyển đổi `startupTask.triggerFloors`; nhập kèm `gen`/`jailbreak`/tag |
| Bản cũ v1.x (Đơn phương án) | Không có `presets`, trường ngoài cùng gồm `tasks`/`referencePool`/`startupTask` | Đóng gói thành một phương án duy nhất mang tên "Phương án đã nhập" |

Trước khi nhập, hệ thống sẽ hiển thị phiên bản nguồn, số lượng phương án và tác vụ để bạn xác nhận; sau khi nhập gõ `/ruby reload` để áp dụng ngay. Mẫu xuất từ phiên bản này cũng có thể nhập ngược lại vào các phiên bản cũ mà không gặp lỗi.

---

## Hướng Dẫn Bảo Mật

- **Bảo mật khóa API**: Khóa API chỉ lưu duy nhất trong `settings.json` của SillyTavern trên máy cá nhân của bạn. Khi xuất thẻ nhân vật, xuất Worldbook hoặc xuất mẫu cấu hình, khóa API tuyệt đối không bị đính kèm theo.
- **Liên kết thẻ bài an toàn**: Việc liên kết chỉ ghi dữ liệu cấu hình tác vụ (phương án / tác vụ / kho tham chiếu / jailbreak / tham số sinh) vào trường `data.extensions.RubyAnalyzer`, hoàn toàn không chứa thông tin đăng nhập hay API key.
- **Gửi nhận qua máy chủ SillyTavern**: Tất cả các yêu cầu phân tích đều được gửi qua dịch vụ yêu cầu chính thức của SillyTavern và do máy chủ trung gian chuyển tiếp ra ngoài, yêu cầu xuất phát hoàn toàn giống với yêu cầu sinh tin nhắn thông thường; trình duyệt không bao giờ gọi trực tiếp đến nhà cung cấp mô hình.
- **Bảo vệ mật khẩu trên UI**: Ô nhập khóa API trên giao diện sử dụng kiểu trường mật mã (`type="password"`), không hiển thị văn bản thuần ra màn hình.
