// import { generateEmbeddings } from "@/lib/ai/generateEmbaddings";
// import { createDocument, updateDocument } from "@/lib/db";
// import { documentProcess } from "@/lib/document-processor";
// import { storeVectors } from "@/lib/pineconeDb";
import { NextRequest,NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  try {
    // get file
    const formdata = await req.formData();
    const file = formdata.get("file") as File;

    //validate the file
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 404 });
    }
    //Todo validate  file type

    //validate file size

    const MAX_Size = 100 * 1024 * 1024; //100mb
    if (file.size > MAX_Size) {
      return NextResponse.json(
        { error: "the maximum file of the size 100mb" },
        { status: 400 }
      );
    }
    //save file info data

    // generate unique id
    const documentId = `doc${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // await createDocument({
    //   documentId,
    //   title:  file.name.split(".")[0],
    //   filename: file.name,
    //   fileType: file.name.split(".").pop()?.toLowerCase() || "unknown",
    //   fileSize: file.size,
    //   uploadedAt: new Date(),
    //   status: "processing",
    // });

     
//     //process the document and chunks
//     const { chunks, content } = await documentProcess(file);

//     console.log("content length",content.length);
    

//     //generate embedding for all chunks
//     const embedding = await generateEmbeddings(chunks);
//     //save vectors in pinecone

//     const vectorCount = await storeVectors(documentId, embedding, {
//       title: file.name.split(".")[0],
//       fileType: file.name.split(".").pop()?.toLowerCase() || "unknown",
//       fileName: file.name,
//     });
//     // update the document

//    const updated=  await updateDocument(documentId, {
//       status: "completed",
//       chunkCount: chunks.length,
//       vectorCount,
//       processedAt: new Date(),
//       contentLength: content.length,
//     });
//     console.log("updating document",updated);
    

    // return file info

    return NextResponse.json(
      {
        success: true,
        documentId,
        message: `successfully processed`,
        fileName: file.name.split(".")[0],
        // status: {
        //   originalSize: file.size,
        //   chunksCount: chunks.length,
        //   vectorCount,
        //   contentLength: content.length,
        // },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("error uploading", error);

    return NextResponse.json(
      {
        error: "failed process document",
        details: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}
