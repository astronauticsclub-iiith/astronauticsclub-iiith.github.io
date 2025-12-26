import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import Logger from "@/lib/logger";
import fs from "fs";
import path from "path";

interface Star {
    ra: number;
    dec: number;
    magnitude: number;
    clickable?: boolean;
    email?: string;
}

interface Constellation {
    stars: Record<string, Star>;
    lines: string[][];
    team: string;
}

const FILE_DIRECTORY = process.env.FILE_DIRECTORY || path.join(process.cwd(), "public/");
const jsonPath = path.join(FILE_DIRECTORY, "constellation.json");
let jsonData: Record<string, Constellation>;

const assignToTeam = (teamName: string, email: string): boolean => {
    let targetConstellation: Constellation | null = null;
    for (const cName in jsonData) {
        if ((jsonData[cName] as Constellation).team === teamName) {
            targetConstellation = jsonData[cName] as Constellation;
            break;
        }
    }

    if (targetConstellation) {
        const availableStars = [];
        for (const starName in targetConstellation.stars) {
            const star = targetConstellation.stars[starName];
            if (!star.email) {
                availableStars.push({ name: starName, ...star });
            }
        }

        availableStars.sort((a, b) => a.magnitude - b.magnitude);
        if (availableStars.length > 0) {
            const bestStar = targetConstellation.stars[availableStars[0].name];
            bestStar.email = email;
            bestStar.clickable = true;
            return true;
        }
    }
    return false;
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { user: adminUser } = await requireAdmin();
        await connectToDatabase();

        const userData = await request.json();
        const { role, designations } = userData;

        if (role && !["admin", "writer", "none"].includes(role)) {
            return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }

        const { id } = await params;

        if (id === adminUser.id) {
            if (role !== undefined || designations !== undefined) {
                return NextResponse.json(
                    { error: "Admins cannot change their own role or designations." },
                    { status: 403 }
                );
            }
        }

        const updateData: Record<string, unknown> = {};
        if (role !== undefined) updateData.role = role;
        if (designations !== undefined) updateData.designations = designations;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const prev_designation =
            adminUser.designations && adminUser.designations.length > 0
                ? adminUser.designations[0]
                : null;
        const designation =
            user.designations && user.designations.length > 0 ? user.designations[0] : null;

        if (
            (!prev_designation && designation) ||
            (prev_designation && designation && prev_designation !== designation)
        ) {
            try {
                // Update constellation.json
                jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

                // Remove user from constellation json
                for (const constellationName in jsonData) {
                    const constellation = jsonData[constellationName];
                    for (const starName in constellation.stars) {
                        const star = constellation.stars[starName];
                        if (star.email === user.email) {
                            delete star.email;
                            star.clickable = false;
                        }
                    }
                }

                // Determine Target Team
                let targetTeamName: string | null = null;
                if (designation) targetTeamName = designation;
                else if (user.role === "admin") targetTeamName = "Co-ordinator";

                let assigned = false;
                if (targetTeamName) {
                    assigned = assignToTeam(targetTeamName, user.email);
                }

                // Admin Fallback (if target team full and user is admin)
                else if (!assigned && user.role === "admin") {
                    assigned = assignToTeam("Co-ordinator", user.email);
                }

                // Random (Brightest available anywhere)
                else if (!assigned) {
                    const allAvailableStars = [];
                    for (const cName in jsonData) {
                        const constellation = jsonData[cName];
                        for (const starName in constellation.stars) {
                            const star = constellation.stars[starName];
                            if (!star.email) {
                                allAvailableStars.push({
                                    constellation: cName,
                                    name: starName,
                                    magnitude: star.magnitude,
                                });
                            }
                        }
                    }

                    allAvailableStars.sort((a, b) => a.magnitude - b.magnitude);
                    if (allAvailableStars.length > 0) {
                        const best = allAvailableStars[0];
                        const star = jsonData[best.constellation].stars[best.name];
                        star.email = user.email;
                        star.clickable = true;
                        assigned = true;
                    }
                }

                if (assigned) {
                    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
                }
            } catch (err) {
                console.error("Error updating constellation.json:", err);
                return NextResponse.json(
                    { error: "Failed to add user to whimsy mode" },
                    { status: 500 }
                );
            }
        }

        // Log the action
        Logger.logWriteOperation("UPDATE_USER", adminUser.email!, "user", user._id.toString(), {
            email: user.email,
            updatedFields: updateData,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user: adminUser } = await requireAdmin();
        await connectToDatabase();

        const { id } = await params;
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Deleting the user avatar
        const avatarFilename = user.avatar;
        if (avatarFilename) {
            const filePath = path.join(FILE_DIRECTORY, avatarFilename); // server path
            fs.unlink(filePath, (error) => {
                if (error) console.error(error);
            });
        }

        await User.findByIdAndDelete(id);

        // Delete from constellation.json
        const jsonPath = path.join(FILE_DIRECTORY, "constellation.json");
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        for (const constellationName in jsonData) {
            const constellation = jsonData[constellationName];
            for (const starName in constellation.stars) {
                const star = constellation.stars[starName];
                if (star.clickable && star.email == user.email) {
                    delete star["email"];
                    star.clickable = false;
                }
            }
        }
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

        // Log the action
        Logger.logWriteOperation("DELETE_USER", adminUser.email!, "user", user._id.toString(), {
            email: user.email,
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
