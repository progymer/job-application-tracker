import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";


async function getBoard(userId: string) {
    "use cache"
    await connectDB();

    const boardDoc = await Board.findOne({
      userId: userId,
      name: "Job Hunt",
    }).populate({
      path: "columns",
      populate: {
        path: "jobApplications",
      },
    });

   if (!boardDoc) return null;

   const board = JSON.parse(JSON.stringify(boardDoc));

   return board;
}

async function DashboardPage() {
    const session = await getSession();
    const board = await getBoard(session?.user.id ?? "");

    if (!session?.user) {
      redirect("/sign-up");
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">{board.name}</h1>
            <p className="text-gray-600">Track your job applications</p>
          </div>
          <KanbanBoard
            board={board}
            userId={session.user.id}
          />
        </div>
      </div>
    );
}

function DashboardSkeleton() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex items-end gap-1">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className="w-1 rounded-full"
            style={{
              height: "36px",
              background: "#f76382",
              animation: "barBounce 1.2s ease-in-out infinite",
              animationDelay: `${(bar - 1) * 0.12}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.2); opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


export default async function Dashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
        </Suspense>
    )
}