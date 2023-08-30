import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

const ServerIdPage: React.FC<ServerIdPageProps> = async ({ params }) => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  // alttaki sorgu sayfa ilk yüklendiğinde her zaman general channel gösterilsin diye.
  // navigation sidebarda kendi kanalıma tıkladığımda beni buraya redirect etmesi için

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const initialChannel = server?.channels[0];

  // teknik olarak bunun olması imkansız ama koruma için koydum
  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(
    `/servers/${params?.serverId}/channels/${initialChannel?.id}`
  );
};

export default ServerIdPage;
