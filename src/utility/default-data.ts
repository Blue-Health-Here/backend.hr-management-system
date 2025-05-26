import { DataSource } from "typeorm";
import { Company, Privilege, Role, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";
import { encrypt } from "./bcrypt-utility";
import { Modules, Privileges, FullSystemAccessPrivileges } from "../constants/index";
import { toCamelCase } from "./string-utility";
import { log } from "console";
import { Gender } from "../models";

export const AddDefaultData = async (dataSource: DataSource) => {

    let companyRepo = dataSource.getRepository(Company);
    let userRepo = dataSource.getRepository(User);
    let roleRepo = dataSource.getRepository(Role);
    let privilegeRepo = dataSource.getRepository(Privilege);
        
    let companyCount = await companyRepo.count();
    let roleCount = await roleRepo.count();

    let company: Company = new Company().toEntity({
                name: "Default",
                phoneNo: "000000000000",
                email: "default@aaepa.com",
                address: "N/A",
                temporaryAddress: "   ",
                zipCode: 0,
                country: "USA",
                state: "California",
                city: "California"
    }, undefined,{name: "Admin", id: EmptyGuid, companyId:'', privileges: []});
    company.id = randomUUID();
            let role: Role = new Role().toEntity(
      { name: "Company Admin", code: "companyAdmin", privilegeIds:[] }, undefined,
      { name: "Admin", id: EmptyGuid, companyId: "", privileges: [] }
            );
            role.id = randomUUID();
    role.privileges = [];
    role.companyId = undefined;
    role.company = undefined;
    let user: User = new User().toEntity(
      {
                userName: "defaultAdmin",
                email: "default@aaepa.com",
                firstName: "Admin",
                middleName: undefined,
                gender: Gender.Male,
                lastName: "User",
                dateOfBirth: new Date(),
                password: "asdf@123",
                roleId: role.id,
                isGoogleSignup: false
      }, undefined,
      { name: "Admin", id: EmptyGuid, companyId: EmptyGuid, privileges: [] }
    );
            
            user.passwordHash = await encrypt("asdf@123");

    if(!roleCount) await roleRepo.insert(role);

    if(!companyCount){
        await companyRepo.insert(company);
        await userRepo.insert({...user,company: company});
        }
        
    
      for (const module of Modules) {
        // let moduleEntity = new Module().newInstanceToAdd(module, toCamelCase(module.replaceAll(" ", "")), [])

        let modulePrivileges: Array<Privilege> = [];
        for (const privilege of Privileges) {
          let privilegeName = `${privilege} ${module}`;
          let privilegeCode = `${privilege}${module.replaceAll(" ", "")}`;
          let pvlg = new Privilege().newInstanceToAdd(
            `${privilegeName}`,
            toCamelCase(privilegeCode)
          );
          pvlg.module = module;
          modulePrivileges.push(
            pvlg
          );
        }

        // moduleEntity.privileges = modulePrivileges;
        await privilegeRepo.save(modulePrivileges);
    }
    


}

export const superAdminSetup = async (dataSource: DataSource) => {
  const companyRepo = dataSource.getRepository(Company);
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const privilegeRepo = dataSource.getRepository(Privilege);

  // const superAdminRoleCode = 
  // const superAdminCompanyName = "HRM System";
  const superAdminEmail = "superadmin@hrm.com";
  const superAdminPassword = "Super@123";

  // ✅ Step 1: Create or update Full System Access Privilege
  const superAdminPrivilegeCode = "fullSystemAccess";
  const superAdminPrivilegeName = "Full System Access";

  let superAdminPrivilege = await privilegeRepo.findOne({ where: { code: superAdminPrivilegeCode } });
  if (superAdminPrivilege) {
    superAdminPrivilege.name = superAdminPrivilegeName;
    superAdminPrivilege.module = "System";
    await privilegeRepo.save(superAdminPrivilege);
  } else {
    superAdminPrivilege = new Privilege().newInstanceToAdd(superAdminPrivilegeName, superAdminPrivilegeCode);
    superAdminPrivilege.module = "System";
    await privilegeRepo.save(superAdminPrivilege);
  }

  // ✅ Step 2: Create or update all other Privileges module-wise (but don't assign to any role)
  for (const module of Modules) {
    for (const privilege of Privileges) {
      const privilegeName = `${privilege} ${module}`;
      const privilegeCode = toCamelCase(`${privilege}${module.replaceAll(" ", "")}`);

      let existingPrivilege = await privilegeRepo.findOne({ where: { code: privilegeCode } });

      if (existingPrivilege) {
        existingPrivilege.name = privilegeName;
        existingPrivilege.module = module;
        await privilegeRepo.save(existingPrivilege);
      } else {
        let newPrivilege = new Privilege().newInstanceToAdd(privilegeName, privilegeCode);
        newPrivilege.module = module;
        await privilegeRepo.save(newPrivilege);
      }
    }
  }

  // ✅ Step 3: Find or create Super Admin Role (assign ONLY Full System Access privilege)
  let superAdminRole = await roleRepo.findOne({ where: { code: FullSystemAccessPrivileges.code } });
  if (!superAdminRole) {
    superAdminRole = new Role().toEntity(
      {
        name: "Super Admin",
        code: FullSystemAccessPrivileges.code,
        privilegeIds: [superAdminPrivilege.id],
      },
      undefined,
      { name: "System", id: EmptyGuid, companyId: "", privileges: [] }
    );
    superAdminRole.id = randomUUID();
    superAdminRole.privileges = [superAdminPrivilege];
    superAdminRole.companyId = undefined;
    superAdminRole.company = undefined;
    await roleRepo.save(superAdminRole);
  } else {
    // Update privilege to only Full System Access
    superAdminRole.privileges = [superAdminPrivilege];
    await roleRepo.save(superAdminRole);
  }

  // ✅ Step 4: Create dummy company for Super Admin
  let superAdminCompany = await companyRepo.findOne({ where: { name: FullSystemAccessPrivileges.name } });
  if (!superAdminCompany) {
    superAdminCompany = new Company().toEntity({
      name: FullSystemAccessPrivileges.name,
      phoneNo: "0000000000",
      email: superAdminEmail,
      address: "System",
      temporaryAddress: "",
      zipCode: 0,
      country: "System",
      state: "System",
      city: "System",
    }, undefined, { name: "System", id: EmptyGuid, companyId: '', privileges: [] });
    superAdminCompany.id = randomUUID();
    await companyRepo.save(superAdminCompany);
  }

  // ✅ Step 5: Create Super Admin User if not exists
  let superAdminUser = await userRepo.findOne({ where: { email: superAdminEmail } });
  if (!superAdminUser) {
    superAdminUser = new User().toEntity({
      userName: "superadmin",
      email: superAdminEmail,
      firstName: "Super",
      middleName: undefined,
      gender: Gender.Male,
      lastName: "Admin",
      dateOfBirth: new Date(),
      password: superAdminPassword,
      roleId: superAdminRole.id,
      isGoogleSignup: false
    }, undefined, { name: "System", id: EmptyGuid, companyId: EmptyGuid, privileges: [] });

    superAdminUser.passwordHash = await encrypt(superAdminPassword);
    superAdminUser.company = superAdminCompany;
    await userRepo.save(superAdminUser);
  }
};
