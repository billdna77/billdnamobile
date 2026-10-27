package com.billdna.mobile;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

/* Sends a file straight into one WhatsApp chat: ACTION_SEND to the WhatsApp package with the
   customer's number as "jid", so the chat opens with the PDF already attached. */
@CapacitorPlugin(name = "WaShare")
public class WaSharePlugin extends Plugin {
    private boolean has(String pkg) {
        try { getContext().getPackageManager().getPackageInfo(pkg, 0); return true; }
        catch (PackageManager.NameNotFoundException e) { return false; }
    }

    @PluginMethod
    public void apps(PluginCall call) {
        JSObject r = new JSObject();
        r.put("whatsapp", has("com.whatsapp"));
        r.put("business", has("com.whatsapp.w4b"));
        call.resolve(r);
    }

    @PluginMethod
    public void send(PluginCall call) {
        String path = call.getString("path", "");
        String phone = call.getString("phone", "");
        String text = call.getString("text", "");
        String pkg = call.getString("pkg", "com.whatsapp");
        String mime = call.getString("mime", "application/pdf");
        if (path.startsWith("file://")) path = Uri.parse(path).getPath();
        File f = new File(path);
        if (!f.exists()) { call.reject("file missing"); return; }
        if (!has(pkg)) { call.reject("notinstalled"); return; }
        try {
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(mime);
            i.setPackage(pkg);
            i.putExtra(Intent.EXTRA_STREAM, uri);
            if (text != null && !text.isEmpty()) i.putExtra(Intent.EXTRA_TEXT, text);
            if (phone != null && !phone.isEmpty()) i.putExtra("jid", phone + "@s.whatsapp.net");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().grantUriPermission(pkg, uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(i);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("notinstalled");
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void chat(PluginCall call) {
        // text-only message to a number (payment reminders)
        String phone = call.getString("phone", "");
        String text = call.getString("text", "");
        String pkg = call.getString("pkg", "com.whatsapp");
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("https://api.whatsapp.com/send?phone=" + phone + "&text=" + Uri.encode(text)));
            if (has(pkg)) i.setPackage(pkg);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
