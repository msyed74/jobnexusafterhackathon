use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

Route::post('/storeMessage', function (Request $request) {
    $userId = $request->userId;
    $mentorId = $request->mentorId;
    $message = $request->text;

    $filePath = "chats/{$userId}_{$mentorId}.json";

    // Fetch existing messages
    $existingMessages = Storage::disk('local')->exists($filePath)
        ? json_decode(Storage::disk('local')->get($filePath), true)
        : [];

    // Append new message
    $existingMessages[] = [
        'sender' => $userId,
        'message' => $message,
        'timestamp' => now(),
    ];

    // Store chat history
    Storage::disk('local')->put($filePath, json_encode($existingMessages));

    return response()->json(['success' => true]);
});

Route::post('/uploadAttachment', function (Request $request) {
    $file = $request->file('attachment');
    $userId = $request->input('userId');
    $fileName = "attachments/{$userId}/" . time() . "." . $file->getClientOriginalExtension();

    Storage::disk('local')->put($fileName, file_get_contents($file));

    return response()->json(['url' => Storage::url($fileName)]);
});
