import {throwCustomError} from "./error-handling.js";

export async function shareDocument(drive, docId, userEmails = []) {
    try {
        const permissionRequests = userEmails.map(email => {
            return drive.permissions.create({
                fileId: docId,
                sendNotificationEmail: false,
                requestBody: {
                    role: 'writer',
                    type: 'user',
                    emailAddress: email,
                },
            });
        });

        // Execute all permission requests concurrently
        await Promise.all(permissionRequests);

        console.log(`Document shared with ${userEmails.join(", ")}`);
    } catch (error) {
        console.error(`Error sharing document with ${userEmails.join(", ")}. Message: `, error);

        throw throwCustomError(
            "SHARE_GOOGLE_DOC_FAILED", error.message, `sharing document with ${userEmails.join(", ")}`
        )
    }
}
