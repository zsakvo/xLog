import { type ActionFunction } from "@remix-run/node"
import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { uploadImage } from "~/lib/upload.server"

import { userModel } from "~/models/user.model"

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await getAuthUser(request, true)
    const data = await uploadImage(request, { userId: user.id })

    const values = z
      .object({
        file: z.string(),
        site: z.string().optional(),
      })
      .parse(data)

    if (values.site) {
      await siteController.updateSite(user, {
        site: values.site,
        icon: values.file,
      })
    } else {
      await userModel.updateProfile(user, { avatar: values.file })
    }

    return { ok: true }
  } catch (error: any) {
    console.error(error)
    return {
      error: error.message,
    }
  }
}
