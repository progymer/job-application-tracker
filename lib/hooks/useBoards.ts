"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "../actions/job-applications";


export function useBoard(initialBoard?: Board | null) {
    const [board, setBoard] = useState<Board | null>(initialBoard || null);
    const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
    const [error, seterror] = useState<string | null>(null);

    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard);
            setColumns(initialBoard.columns || []);
        }
    }, [initialBoard]);

    async function moveJob(
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ){
        setColumns((prev) => {
            const newColumns = prev.map((col) => ({
                ...col,
                jobApplications: [...col.jobApplications]
            }))

            let jobToMove: JobApplication | null = null;
            let oldColumnId: string | null = null;

            for (const col of newColumns){
                const jobIndex = col.jobApplications.findIndex(
                    (j) => j._id === jobApplicationId
                )
                if (jobIndex !== -1 && jobIndex !== undefined) {
                    jobToMove = col.jobApplications[jobIndex];
                    oldColumnId = col._id;
                    col.jobApplications = col.jobApplications.filter(
                        (j) => j._id !== jobApplicationId
                    )
                    break;
                }
            }

            if (jobToMove && oldColumnId) {
                const tragetColumnIndex = newColumns.findIndex(
                    (col) => col._id === newColumnId
                )
                if (tragetColumnIndex !== -1) {
                    const tragetColumn = newColumns[tragetColumnIndex];
                    const currentJobs = tragetColumn.jobApplications || [];

                    const updatedJobs = [...currentJobs];
                    updatedJobs.splice(newOrder, 0, {
                        ...jobToMove,
                        columnId: newColumnId,
                        order: newOrder * 100,
                    })

                    const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
                        ...job,
                        order: idx * 100,
                    }))

                    newColumns[tragetColumnIndex] = {
                        ...tragetColumn,
                        jobApplications: jobsWithUpdatedOrders
                    }
                }
            } 
            
            return newColumns;
        })

        try {
            const result = await updateJobApplication(jobApplicationId, {
                columnId: newColumnId,
                order: newOrder,
            })
        } catch (err) {
            console.error("faild to move job", err)
        }
    }

    return { board, columns, error, moveJob}
}